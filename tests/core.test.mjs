import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog.js';
import {LEVELS, fields, matchModel, autoFields, validateFields, applyFields} from '../src/core.js';
const provider = {api: 'anthropic-messages', baseURL: 'https://fixture.invalid/claude', models: [{id: 'claude-opus-5-5', name: 'Opus', contextWindow: 256000, maxTokens: 32000, compat: {supportsCacheControl: true}}, {id: 'other', custom: 1}]};
const draft = () => autoFields(matchModel('claude-opus-5-5', provider), provider.api);
test('官方目录模型和协议不重复，来源完整，档位都在 DSH schema 范围内', () => {
  const pairs = new Set();
  for (const entry of catalog) {
    assert.ok(entry.sources.every(s => s.startsWith('https://')));
    assert.ok(entry.levels.length && entry.levels.every(l => LEVELS.includes(l)));
    validateFields(autoFields(entry, entry.apis[0]));
    for (const id of entry.ids) for (const api of entry.apis) {const key = `${id}:${api}:${entry.hosts ?? '*'}`; assert.ok(!pairs.has(key), key); pairs.add(key);}
  }
});
test('按精确模型 ID 匹配，未知后缀和未来版本不能继承能力', () => {
  assert.deepEqual(draft().reasoningEfforts, {low: 'low', medium: 'medium', high: 'high', xhigh: 'xhigh', max: 'max'});
  assert.equal(draft().defaultReasoningEffort, 'high');
  for (const id of ['claude-opus-5-5-thinking', 'claude-opus-5-6', 'claude-opus-5-5-20990101', 'CLAUDE-OPUS-5-5']) assert.equal(matchModel(id, provider), null);
  assert.deepEqual(matchModel('claude-sonnet-4-6', provider).levels, ['low', 'medium', 'high', 'max']);
});
test('不同 API、托管端点和默认关闭能力不混用', () => {
  assert.equal(matchModel('claude-opus-5-5', {...provider, api: 'openai-completions'}), null);
  assert.equal(matchModel('glm-5.3', {api: 'openai-completions', baseURL: 'https://api.z.ai/v1'}), null);
  assert.ok(matchModel('glm-5.3', {api: 'openai-completions', baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'}));
  assert.equal(matchModel('glm-5.3', {api: 'openai-completions', baseURL: 'https://dashscope.aliyuncs.com.evil.invalid'}), null);
  assert.equal(matchModel('gpt-6-astra', {api: 'openai-completions'}), null);
  assert.ok(!matchModel('gpt-6-astra', {api: 'openai-responses'}).levels.includes('off'));
});
test('更新原生模型草稿时保留容量、输入类型和无关 compat，不改原对象', () => {
  const original = {...provider.models[0], maxTokens: 64000, input: ['text', 'image']};
  const next = applyFields(original, draft());
  assert.equal(next.contextWindow, 256000);
  assert.equal(next.maxTokens, 64000);
  assert.deepEqual(next.input, ['text', 'image']);
  assert.equal(next.compat.supportsCacheControl, true);
  assert.equal(next.compat.forceAdaptiveThinking, true);
  assert.equal(original.reasoningEfforts, undefined);
  assert.equal(original.compat.forceAdaptiveThinking, undefined);
});
test('重置恢复原字段；清空档位为 false；无效档位不能写入原生草稿', () => {
  const original = provider.models[0], modified = applyFields(original, draft());
  assert.deepEqual(applyFields(modified, fields(original)), original);
  assert.equal(applyFields(modified, {reasoningEfforts: false, compat: {}}).reasoningEfforts, false);
  for (const efforts of [{}, {off: 'none'}, {ultra: 'ultra'}, {high: ''}, {high: null}]) assert.throws(() => applyFields(original, {reasoningEfforts: efforts, compat: {}}));
  validateFields({reasoningEfforts: {off: null, high: 'ultra'}});
});
test('默认档位必须属于模型自己的档位，off 与默认高档独立', () => {
  const off = {reasoningEfforts: {off: 'none', high: 'high'}, defaultReasoningEffort: 'off', compat: {}};
  assert.equal(applyFields(provider.models[0], off).defaultReasoningEffort, 'off');
  assert.throws(() => validateFields({...draft(), defaultReasoningEffort: 'off'}));
  assert.throws(() => validateFields({reasoningEfforts: false, defaultReasoningEffort: 'high'}));
  for (const entry of catalog) assert.ok(entry.levels.includes(autoFields(entry, entry.apis[0]).defaultReasoningEffort));
});
