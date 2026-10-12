import { catalog } from './catalog.js';
export const LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'];
const MANAGED = ['forceAdaptiveThinking', 'supportsReasoningEffort', 'thinkingFormat'];
export const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
export const chooseDefault = levels => ['high', 'medium', ...LEVELS.filter(k => k !== 'off')].find(k => levels.includes(k));
export function fields(model) {
  return {reasoningEfforts: clone(model.reasoningEfforts), defaultReasoningEffort: model.defaultReasoningEffort, compat: Object.fromEntries(MANAGED.filter(k => Object.hasOwn(model.compat ?? {}, k)).map(k => [k, model.compat[k]]))};
}
export function matchModel(id, provider) {
  // Exact IDs only: no prefix, substring, invented snapshot, or fuzzy family matching.
  const candidates = catalog.filter(entry => entry.ids.includes(id));
  let host = '';
  try {host = new URL(provider.baseURL).hostname;} catch {}
  return candidates.find(entry => entry.apis.includes(provider.api) && (!entry.hosts || entry.hosts.some(h => host === h || host.endsWith(`.${h}`)))) ?? null;
}
export function autoFields(entry, api) {
  if (!entry) throw new Error('该模型和接口尚无可用的官方匹配规则。');
  const reasoningEfforts = Object.fromEntries(entry.levels.map(k => [k, k === 'off' ? entry.offValue ?? 'none' : k]));
  const compat = api === 'anthropic-messages' ? {forceAdaptiveThinking: true} : api === 'openai-completions' ? {supportsReasoningEffort: true, thinkingFormat: entry.format ?? 'openai'} : {};
  return {reasoningEfforts, defaultReasoningEffort: entry.defaultEffort ?? chooseDefault(entry.levels), compat};
}
export function validateFields(draft) {
  const efforts = draft.reasoningEfforts;
  if (efforts === undefined || efforts === false) {
    if (draft.defaultReasoningEffort !== undefined) throw new Error('没有可选档位时不能设置默认档位。');
    return;
  }
  if (!efforts || typeof efforts !== 'object' || Array.isArray(efforts)) throw new Error('档位配置格式不正确。');
  const keys = Object.keys(efforts);
  if (draft.defaultReasoningEffort !== undefined && !keys.includes(draft.defaultReasoningEffort)) throw new Error('默认档位必须是已配置的档位。');
  if (!keys.length || keys.every(k => k === 'off')) throw new Error('至少保留一个思考档位。');
  for (const k of keys) {
    if (!LEVELS.includes(k)) throw new Error(`DSH 当前不支持档位键：${k}`);
    const v = efforts[k];
    if (!(k === 'off' && v === null) && (typeof v !== 'string' || !v.trim())) throw new Error(`${k} 的接口值不能为空。`);
  }
}
export function applyFields(model, draft) {
  validateFields(draft);
  const next = {...model};
  if (draft.reasoningEfforts === undefined) delete next.reasoningEfforts;
  else next.reasoningEfforts = clone(draft.reasoningEfforts);
  if (draft.defaultReasoningEffort === undefined) delete next.defaultReasoningEffort;
  else next.defaultReasoningEffort = draft.defaultReasoningEffort;
  const compat = {...model.compat};
  for (const key of MANAGED) {
    if (Object.hasOwn(draft.compat, key)) compat[key] = draft.compat[key];
    else delete compat[key];
  }
  if (Object.keys(compat).length) next.compat = compat;
  else delete next.compat;
  return next;
}
