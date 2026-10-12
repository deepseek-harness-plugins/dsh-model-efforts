import {spawn} from 'node:child_process';
import {mkdtemp, mkdir, writeFile, readFile, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const project = resolve(new URL('..', import.meta.url).pathname);
const root = await mkdtemp(join(tmpdir(), 'dme-host-'));
const home = join(root, 'home'), workspace = join(root, 'workspace'), profile = join(home, 'profiles/web');
const artifacts = join(project, 'test-results');
const requests = [];
const mock = createServer(async (req, res) => {
  let body = ''; for await (const chunk of req) body += chunk;
  requests.push(JSON.parse(body));
  res.writeHead(200, {'Content-Type': 'text/event-stream'});
  const send = (type, data) => res.write(`event: ${type}\ndata: ${JSON.stringify({type, ...data})}\n\n`);
  send('message_start', {message: {id: 'msg_fixture', type: 'message', role: 'assistant', content: [], model: 'claude-opus-5-5', stop_reason: null, stop_sequence: null, usage: {input_tokens: 1, output_tokens: 0}}});
  send('content_block_start', {index: 0, content_block: {type: 'text', text: ''}});
  send('content_block_delta', {index: 0, delta: {type: 'text_delta', text: '本地测试已收到思考档位。'}});
  send('content_block_stop', {index: 0});
  send('message_delta', {delta: {stop_reason: 'end_turn', stop_sequence: null}, usage: {output_tokens: 5}});
  send('message_stop', {}); res.end();
});
await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
const mockURL = `http://127.0.0.1:${mock.address().port}`;
await mkdir(join(profile, 'node_modules/@deepseekharness-plugin'), {recursive: true});
await mkdir(workspace); await mkdir(artifacts, {recursive: true});
await symlink(project, join(profile, 'node_modules/@deepseekharness-plugin/dsh-model-efforts'));
await writeFile(join(profile, 'package.json'), JSON.stringify({name: 'dme-host-test', private: true, dependencies: {'@deepseekharness-plugin/dsh-model-efforts': `link:${project}`}, dsh: {profile: {bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app']}}}));
await writeFile(join(profile, 'cordis.yml'), '[]');
await writeFile(join(profile, 'cordis.patch.yml'), JSON.stringify([
  {id: 'ui-settings-general', config: {welcomeNoticeVersion: '2026-09-28.1'}},
  {id: 'session-title-llm', disabled: true},
  {id: 'llm-pi-ai', config: {providers: {'effort-fixture': {displayName: '模型思考档位', api: 'anthropic-messages', baseURL: mockURL, apiKeyEnv: 'DME_TEST_API_KEY', models: [{id: 'claude-opus-5-5', name: 'claude-opus-5-5', contextWindow: 256000, maxTokens: 32000}, {id: 'claude-sonnet-4-6', name: 'claude-sonnet-4-6'}, {id: 'custom-model', name: 'custom-model'}]}}}}
]));
const cli = process.env.DME_CLI ?? '/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh';
let log = '', browser, page;
const errors = [];
const child = spawn(cli, ['--profile', 'web', '--host', '127.0.0.1', '--port', '0', '--no-open'], {cwd: workspace, env: {...process.env, DSH_HOME: home, DSH_TELEMETRY_DISABLED: '1', DME_TEST_API_KEY: 'fixture-unused'}});
child.stdout.on('data', chunk => {log += chunk;}); child.stderr.on('data', chunk => {log += chunk;});
try {
  let url;
  for (let n = 0; n < 120; n++) {
    url = log.match(/dsh web: (http:\/\/\S+)/)?.[1];
    if (url) break;
    if (child.exitCode !== null) throw new Error(log);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!url) throw new Error('DSH 启动超时：' + log);
  browser = await chromium.launch({channel: process.env.DME_BROWSER ?? 'chrome', headless: true});
  page = await browser.newPage({viewport: {width: 1180, height: 900}, locale: 'zh-CN'});
  page.on('pageerror', e => errors.push(e.message));
  page.setDefaultTimeout(12000);
  await page.goto(url, {waitUntil: 'domcontentloaded'});
  await page.locator('[contenteditable=true]').waitFor();
  if (await page.getByRole('button', {name: '继续', exact: true}).count()) await page.getByRole('button', {name: '继续', exact: true}).click();
  await page.screenshot({path: join(artifacts, 'host-start.png')});
  console.log('HOST_STARTED', 'BODY', (await page.locator('body').innerText()).slice(0, 3000));
  await page.getByRole('button', {name: '插件', exact: true}).click();
  console.log('PLUGIN_PAGE', (await page.locator('body').innerText()).slice(-3500));
  await page.getByRole('switch', {name: '启用 @deepseekharness-plugin/dsh-model-efforts', exact: true}).click();
  const settingsButton = page.getByRole('button', {name: /设置|Settings/i}).first();
  await settingsButton.click();
  await page.getByRole('button', {name: /^(模型|Models)$/}).click();
  const editButton = page.getByRole('button', {name: /^编辑 模型思考档位/});
  const nativeRows = page.locator('[class*="_modelEntry"]');
  const openEditor = async () => {
    await editButton.click();
    const details = page.locator('details[class*="_customized"]');
    if (!await details.evaluate(el => el.open)) await details.locator('summary').click();
    await nativeRows.first().waitFor();
  };
  const expand = async index => {
    const row = nativeRows.nth(index), toggle = row.getByRole('button', {name: /^模型选项/});
    if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
    await row.locator('.dme').waitFor();
    return row.locator('.dme');
  };
  const save = async () => {
    await page.getByRole('button', {name: '保存', exact: true}).click();
    await page.locator('[class*="_editorRoute"]').waitFor({state: 'detached'});
  };
  const chips = async (id, count) => page.waitForFunction(({id, count}) => document.querySelector('[aria-label="' + id + ' 思考强度"]')?.querySelectorAll('.dme-chip').length === count, {id, count});
  const configPath = join(profile, 'cordis.patch.yml');
  await openEditor();
  let panel = await expand(0);
  // Effort-only edits must dirty the native draft without an unrelated field.
  await panel.getByRole('button', {name: '自动匹配', exact: true}).click();
  await chips('claude-opus-5-5', 5);
  assert.equal(await panel.getByRole('button', {name: '设 high 为默认档位'}).getAttribute('aria-pressed'), 'true');
  assert.equal(await panel.getByLabel('增加思考档位').locator('option[value="off"]').isDisabled(), true);
  await panel.getByRole('button', {name: '删除 xhigh 档位'}).click();
  await chips('claude-opus-5-5', 4);
  await panel.getByLabel('增加思考档位').selectOption('xhigh');
  await panel.getByRole('button', {name: '重置', exact: true}).click();
  await chips('claude-opus-5-5', 0);
  await panel.getByRole('button', {name: '自动匹配', exact: true}).click();
  await panel.getByRole('button', {name: '设 low 为默认档位'}).click();
  await nativeRows.nth(0).getByRole('button', {name: /^模型选项/}).click();
  panel = await expand(0);
  assert.equal(await panel.locator('.dme-chip').count(), 5);
  const layout = await nativeRows.first().locator('[class*="_modelAdvanced"]').evaluate(el => [...el.children].map(n => n.tagName + ':' + n.className));
  assert.match(layout[0], /^LABEL:/); assert.match(layout[1], /^LABEL:/);
  assert.match(layout[2], /dme-mount/); assert.match(layout[3], /^FIELDSET:/);
  assert.equal(await panel.getByRole('button').count(), 12);
  assert.equal(await panel.getByRole('button', {name: '设 low 为默认档位'}).getAttribute('aria-pressed'), 'true');
  assert.equal(await panel.locator('p, details, input, a').count(), 0);
  await nativeRows.first().screenshot({path: join(artifacts, 'model-efforts.png')});
  await page.screenshot({path: join(artifacts, 'host-model-efforts.png')});
  await save();
  let stored = await readFile(configPath, 'utf8');
  assert.match(stored, /forceAdaptiveThinking: true/); assert.match(stored, /xhigh: xhigh/);
  assert.match(stored, /defaultReasoningEffort: low/);

  // A default-only change must persist and refresh the catalog too.
  await openEditor();
  panel = await expand(0);
  await panel.getByRole('button', {name: '设 medium 为默认档位'}).click();
  await save();
  stored = await readFile(configPath, 'utf8');
  assert.match(stored, /defaultReasoningEffort: medium/);

  await openEditor();
  panel = await expand(0);
  assert.equal(await panel.locator('.dme-chip').count(), 5);
  await panel.getByRole('button', {name: '删除 max 档位'}).click();
  await panel.getByRole('button', {name: '重置', exact: true}).click();
  await chips('claude-opus-5-5', 5);
  assert.equal(await panel.getByRole('button', {name: '设 medium 为默认档位'}).getAttribute('aria-pressed'), 'true');
  await panel.getByRole('button', {name: '设 max 为默认档位'}).click();
  await nativeRows.nth(0).getByLabel('最大输出 token 数 1', {exact: true}).fill('64K');
  let sonnet = await expand(1);
  await sonnet.getByRole('button', {name: '自动匹配', exact: true}).click();
  await chips('claude-sonnet-4-6', 4);
  assert.equal(await sonnet.getByLabel('增加思考档位').locator('option[value="xhigh"]').isDisabled(), true);
  await page.getByRole('button', {name: '取消', exact: true}).click();
  await page.locator('[class*="_editorRoute"]').waitFor({state: 'detached'});
  assert.equal(await readFile(configPath, 'utf8'), stored);

  // Capacities, rename, model addition/removal and effort declarations share Save.
  await openEditor();
  panel = await expand(0);
  await nativeRows.nth(0).getByLabel('最大输出 token 数 1', {exact: true}).fill('64K');
  const custom = await expand(2);
  assert.equal(await custom.getByRole('button', {name: '自动匹配', exact: true}).isDisabled(), true);
  await custom.getByLabel('增加思考档位').selectOption('high');
  await custom.getByLabel('增加思考档位').selectOption('off');
  await custom.getByRole('button', {name: '设 off 为默认档位'}).click();
  await nativeRows.nth(2).getByLabel('模型 ID 3', {exact: true}).fill('custom-renamed');
  await page.getByRole('button', {name: '添加模型', exact: true}).click();
  await nativeRows.nth(3).getByLabel('模型 ID 4', {exact: true}).fill('claude-sonnet-5-5');
  sonnet = await expand(3);
  await sonnet.getByRole('button', {name: '自动匹配', exact: true}).click();
  await chips('claude-sonnet-5-5', 5);
  await sonnet.getByRole('button', {name: '设 xhigh 为默认档位'}).click();
  await nativeRows.nth(1).getByRole('button', {name: /^移除模型|^删除模型/}).click();
  await page.waitForFunction(() => document.querySelectorAll('[class*="_modelEntry"]').length === 3);
  const renamed = await expand(1);
  assert.equal(await renamed.locator('.dme-chip').count(), 2);
  assert.equal(await renamed.getByRole('button', {name: '设 off 为默认档位'}).getAttribute('aria-pressed'), 'true');
  assert.equal(await renamed.getAttribute('aria-label'), 'custom-renamed 思考强度');
  sonnet = await expand(2);
  assert.equal(await sonnet.locator('.dme-chip').count(), 5);
  await save();
  stored = await readFile(configPath, 'utf8');
  assert.match(stored, /maxTokens: 64000/); assert.match(stored, /id: custom-renamed/);
  assert.match(stored, /id: claude-sonnet-5-5/); assert.doesNotMatch(stored, /id: claude-sonnet-4-6/);
  assert.match(stored, /defaultReasoningEffort: off/); assert.match(stored, /defaultReasoningEffort: xhigh/);
  await openEditor();
  panel = await expand(0);
  assert.equal(await panel.locator('.dme-chip').count(), 5);
  assert.equal(await nativeRows.nth(0).getByLabel('最大输出 token 数 1', {exact: true}).inputValue(), '64K');
  assert.equal(await (await expand(1)).locator('.dme-chip').count(), 2);
  assert.equal(await (await expand(2)).locator('.dme-chip').count(), 5);
  // Native validation blocks saving; the effort draft stays local.
  await nativeRows.nth(0).getByLabel('最大输出 token 数 1', {exact: true}).fill('-1');
  await panel.getByRole('button', {name: '删除 max 档位'}).click();
  assert.equal(await page.getByRole('button', {name: '保存', exact: true}).isDisabled(), true);
  assert.equal(await readFile(configPath, 'utf8'), stored);
  await page.getByRole('button', {name: '取消', exact: true}).click();
  await page.getByRole('button', {name: '关闭', exact: true}).click();
  await page.getByText('新会话', {exact: true}).first().click();
  await page.getByRole('button', {name: /^选择模型/}).click();
  await page.getByRole('menuitem', {name: /模型/}).click();
  await page.getByRole('menuitemradio', {name: 'claude-opus-5-5', exact: true}).click();
  await page.getByRole('button', {name: /^选择模型/}).click();
  await page.getByRole('menuitem', {name: /推理等级/}).click();
  console.log('COMPOSER_LEVELS', await page.getByRole('menuitemradio').allTextContents());
  assert.deepEqual(await page.getByRole('menuitemradio').allTextContents(), ['Low', 'Medium', 'High', 'Xhigh', 'Max']);
  assert.equal(await page.getByRole('menuitemradio', {name: 'Medium', exact: true}).getAttribute('aria-checked'), 'true');
  await page.getByRole('menuitemradio', {name: 'Medium', exact: true}).click();
  const send = async text => {
    const before = requests.length;
    await page.locator('[contenteditable=true]').fill(text);
    await page.locator('[contenteditable=true]').press('Enter');
    await page.waitForFunction(count => [...document.querySelectorAll('body *')].filter(el => el.children.length === 0 && el.textContent === '本地测试已收到思考档位。').length >= count, before + 1);
  };
  await send('确认默认 medium 档位');
  assert.equal(requests.at(-1).output_config.effort, 'medium');
  await page.getByRole('button', {name: /^选择模型/}).click();
  await page.getByRole('menuitem', {name: /推理等级/}).click();
  await page.getByRole('menuitemradio', {name: 'Max', exact: true}).click();
  await send('确认显式 max 档位');
  assert.equal(requests.at(-1).output_config.effort, 'max');
  assert.equal(requests.at(-1).thinking.type, 'adaptive');
  await writeFile(join(artifacts, 'request.json'), JSON.stringify(requests.at(-1), null, 2));
  await page.screenshot({path: join(artifacts, 'composer-effort.png')});
  await page.getByRole('button', {name: /^选择模型/}).click();
  await page.getByRole('menuitem', {name: /模型/}).click();
  await page.getByRole('menuitemradio', {name: 'custom-model', exact: true}).click();
  await page.getByRole('button', {name: /^选择模型/}).click();
  await page.getByRole('menuitem', {name: /推理等级/}).click();
  assert.deepEqual(await page.getByRole('menuitemradio').allTextContents(), ['Off', 'High']);
  assert.equal(await page.getByRole('menuitemradio', {name: 'Off', exact: true}).getAttribute('aria-checked'), 'true');
  await page.getByRole('menuitemradio', {name: 'Off', exact: true}).click();
  await send('确认 off 明确关闭');
  assert.equal(requests.at(-1).thinking.type, 'disabled');
  assert.equal(requests.at(-1).output_config, undefined);
  await page.getByRole('button', {name: '插件', exact: true}).click();
  await page.getByRole('switch', {name: '启用 @deepseekharness-plugin/dsh-model-efforts', exact: true}).click();
  await page.getByText('新会话', {exact: true}).first().click();
  await page.getByRole('button', {name: /^选择模型/}).click();
  await page.getByRole('menuitem', {name: /模型/}).click();
  await page.getByRole('menuitemradio', {name: 'claude-opus-5-5', exact: true}).click();
  await page.getByRole('button', {name: /^选择模型/}).click();
  await page.getByRole('menuitem', {name: /推理等级/}).click();
  assert.deepEqual(await page.getByRole('menuitemradio').allTextContents(), ['Default', 'Low', 'Medium', 'High', 'Xhigh', 'Max']);
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('UI_TEST_PASSED', JSON.stringify({root, screenshots: artifacts, assertions: 'inline placement, native save/cancel/reset, per-model and default-only save, no Default with an explicit default, medium default request, explicit max override, off disabled request, plugin disable restores native Default, no page errors'}));
} catch (e) {
  console.error('PAGE_ERRORS', errors);
  if (page) console.error('INLINE_DIAGNOSTIC', await page.evaluate(() => {
    const el = document.querySelector('[class*="_modelEntry"]'), owner = document.querySelector('[data-dme-owner]');
    let f = el && el[Object.keys(el).find(k => k.startsWith('__reactFiber$'))];
    const ancestors = [];
    while (f) {const p = f.memoizedProps; ancestors.push({type: f.type?.name, inputField: p?.inputField, ns: p?.probe?.settingsNs, namespace: p?.namespace?.ns, onChange: typeof p?.onChange}); f = f.return;}
    return {owner: owner?.parentElement?.className, scope: owner?.closest('[class*="_section"]')?.className, mounts: document.querySelectorAll('.dme-mount').length, ancestors};
  }));
  if (page) {await page.screenshot({path: join(artifacts, 'failure.png')}); console.error((await page.locator('body').innerText()).slice(0, 5000));}
  throw e;
} finally {
  await writeFile(join(artifacts, 'host.log'), log);
  await browser?.close(); child.kill('SIGTERM'); mock.close();
}
