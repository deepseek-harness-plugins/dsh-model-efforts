// Curated from official documentation; verified 2026-10-12. Exact model IDs only.
// Hosted capabilities are scoped to their endpoint so they cannot overwrite native API rules.
export const checkedOn = '2026-10-12';
const openai = 'https://developers.openai.com/api/docs/models/';
const claude = 'https://platform.claude.com/docs/en/build-with-claude/effort';
const claudeThinking = 'https://platform.claude.com/docs/en/build-with-claude/thinking#configuring-thinking';
const google = 'https://ai.google.dev/gemini-api/docs/openai';
const googleThinking = 'https://ai.google.dev/gemini-api/docs/thinking';
const deepseek = 'https://api-docs.deepseek.com/api/list-models/';
const qwen = 'https://docs.qwencloud.com/api-reference/chat/openai-chat';
const grok = 'https://docs.x.ai/developers/model-capabilities/text/reasoning';
const oaApis = ['openai-completions', 'openai-responses'];
const lmhm = ['low', 'medium', 'high', 'max'];
const lmhxm = ['low', 'medium', 'high', 'xhigh', 'max'];
const offlmhx = ['off', 'low', 'medium', 'high', 'xhigh'];
// This is the plugin's initial selection, not a claim about a provider's API
// default. Users can change it with the set-default button in each chip.
const add = (vendor, ids, levels, sources, extra = {}) => ({vendor, ids, levels, sources,
  defaultEffort: levels.includes('high') ? 'high' : levels.includes('medium') ? 'medium' : levels.find(k => k !== 'off'), apis: oaApis, ...extra});
const o = (id, levels, snapshots = [], extra = {}) => add('OpenAI', [id, ...snapshots], levels, [openai + id], extra);
const a = (ids, levels, note) => add('Anthropic', ids, levels, [claude, claudeThinking], {apis: ['anthropic-messages'], note});
const g = (ids, levels, note) => add('Google', ids, levels, [google, googleThinking], {apis: ['openai-completions'], note});
const hosted = {apis: ['openai-completions'], format: 'qwen', hosts: ['dashscope.aliyuncs.com', 'dashscope-intl.aliyuncs.com', 'dashscope.qwen.ai', 'dashscope-us.aliyuncs.com', 'dashscope-eu.aliyuncs.com'], note: '这条规则仅适用于 QwenCloud / DashScope 托管接口。'};
export const catalog = [
  a(['claude-fable-5-1', 'claude-mythos-5-1', 'claude-fable-5', 'claude-mythos-5', 'claude-opus-5-5', 'claude-sonnet-5-5'], lmhxm, '不支持完整关闭思考。Sonnet 5.5 的 between_tools 仅关闭前置思考，因此不标为 off。'),
  a(['claude-opus-5', 'claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-5', 'claude-haiku-5-5'], ['off', ...lmhxm], 'off 发送 thinking.type = disabled，不附 output_config.effort。Opus 5 和 Haiku 5.5 禁止 disabled 与 xhigh / max 组合。'),
  a(['claude-mythos-preview'], lmhm, '使用自适应思考；不支持关闭思考。'),
  a(['claude-opus-4-6', 'claude-sonnet-4-6'], ['off', ...lmhm], 'off 发送 thinking.type = disabled；其余档位使用自适应思考。'),
  o('gpt-6-astra', lmhxm, [], {apis: ['openai-responses'], note: 'DSH 需要工具调用，因此仅自动适配 Responses。'}),
  o('gpt-6.1-sol', lmhxm, [], {apis: ['openai-responses'], note: '工具调用需要 Responses；不支持 none / minimal。'}),
  o('gpt-6-sol', ['off', ...lmhxm], [], {apis: ['openai-responses'], note: '带思考的工具调用需要 Responses。'}),
  o('gpt-6-luna', ['off', ...lmhxm], [], {apis: ['openai-responses'], note: '带思考的工具调用需要 Responses。'}),
  o('gpt-5.6-sol', ['off', ...lmhxm], ['gpt-5.6']),
  o('gpt-5.6-terra', ['off', ...lmhxm]),
  o('gpt-5.6-luna', ['off', ...lmhxm]),
  o('gpt-5.5', offlmhx, ['gpt-5.5-2026-04-23']),
  o('gpt-5.4', offlmhx, ['gpt-5.4-2026-03-05']),
  o('gpt-5.4-mini', offlmhx, ['gpt-5.4-mini-2026-03-17']),
  o('gpt-5.4-nano', offlmhx, ['gpt-5.4-nano-2026-03-17']),
  o('gpt-5.3-codex', ['low', 'medium', 'high', 'xhigh'], [], {apis: ['openai-responses']}),
  o('gpt-5.2-codex', ['low', 'medium', 'high', 'xhigh'], [], {apis: ['openai-responses']}),
  o('gpt-5.2', offlmhx, ['gpt-5.2-2025-12-11']),
  o('gpt-5.2-pro', ['medium', 'high', 'xhigh'], ['gpt-5.2-pro-2025-12-11'], {apis: ['openai-responses']}),
  o('gpt-5.1', ['off', 'low', 'medium', 'high'], ['gpt-5.1-2025-11-13']),
  o('gpt-5', ['minimal', 'low', 'medium', 'high'], ['gpt-5-2025-08-07']),
  add('OpenAI', ['gpt-5-mini', 'gpt-5-mini-2025-08-07', 'gpt-5-nano', 'gpt-5-nano-2025-08-07'], ['minimal', 'low', 'medium', 'high'], ['https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5']),
  o('gpt-5-pro', ['high'], ['gpt-5-pro-2025-10-06'], {apis: ['openai-responses']}),
  add('OpenAI', ['o3', 'o3-2025-04-16', 'o4-mini', 'o4-mini-2025-04-16'], ['low', 'medium', 'high'], ['https://developers.openai.com/cookbook/examples/partners/model_selection_guide/model_selection_guide'], {note: '历史模型；档位依据官方已归档的模型指南。'}),
  add('OpenAI', ['o3-mini', 'o3-mini-2025-01-31'], ['low', 'medium', 'high'], ['https://developers.openai.com/cookbook/examples/object_oriented_agentic_approach/secure_code_interpreter_tool_for_llm_agents']),
  o('gpt-oss-120b', ['low', 'medium', 'high'], [], {apis: ['openai-completions'], note: '所用推理服务须支持将 reasoning_effort 转为 Harmony 的推理指令。'}),
  o('gpt-oss-20b', ['low', 'medium', 'high'], [], {apis: ['openai-completions'], note: '所用推理服务须支持将 reasoning_effort 转为 Harmony 的推理指令。'}),
  g(['gemini-3.8-flash'], ['low', 'medium', 'high']),
  g(['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3-flash-preview'], ['minimal', 'low', 'medium', 'high']),
  g(['gemini-3.1-pro-preview'], ['low', 'medium', 'high']),
  g(['gemini-3-pro-preview'], ['low', 'high']),
  g(['gemini-2.5-pro'], ['low', 'medium', 'high'], 'OpenAI 兼容接口把档位映射为 token 预算；不是原生固定档位。'),
  g(['gemini-2.5-flash', 'gemini-2.5-flash-lite'], ['off', 'low', 'medium', 'high'], 'OpenAI 兼容接口把档位映射为 token 预算；不是原生固定档位。'),
  add('DeepSeek', ['deepseek-flash', 'deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-v4-flash-vision-exp'], ['off', 'low', 'high', 'max'], [deepseek, 'https://api-docs.deepseek.com/'], {format: 'deepseek', note: '旧 Flash ID 在官方接口会路由到 V4.1-Flash。'}),
  add('Qwen', ['qwen3.8-max', 'qwen3.8-max-0902', 'qwen3.8-flash', 'qwen3.8-27b', 'qwen3.8-omni-flash'], ['off', 'low', 'medium', 'xhigh'], [qwen], {apis: ['openai-completions'], format: 'qwen', note: '去掉映射为同一档的兼容别名；不可同时设置 thinking_budget。'}),
  add('Qwen', ['qwen3.8-2.4t-a95b'], ['low', 'medium', 'xhigh'], [qwen], {apis: ['openai-completions'], format: 'qwen', note: '该模型仅有思考模式；不可同时设置 thinking_budget。'}),
  add('GLM（QwenCloud）', ['glm-5.2', 'glm-5.1', 'glm-5'], ['high', 'max'], [qwen], hosted),
  add('GLM（QwenCloud）', ['glm-5.3', 'ZHIPU/GLM-5.3'], ['low', 'high', 'max'], [qwen], hosted),
  add('Kimi（QwenCloud）', ['kimi-k3'], ['off', 'low', 'high', 'max'], [qwen], hosted),
  add('Kimi（QwenCloud）', ['kimi/kimi-k3'], ['max'], [qwen], hosted),
  add('xAI', ['grok-4.7', 'grok-4.6'], ['low', 'medium', 'high', 'xhigh'], [grok]),
  add('xAI', ['grok-4.5'], ['low', 'medium', 'high'], [grok]),
];
