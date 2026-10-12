import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {LEVELS, fields, matchModel, autoFields, applyFields, validateFields, chooseDefault} from './core.js';
import {rowBridge, observeModelRows} from './editor-bridge.js';
import css from './styles.css';

export const inject = ['slots'];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function EffortRow({row}) {
  const [error, setError] = useState('');
  const entry = matchModel(row.id, row.provider);
  const draft = row.fields;
  const active = Object.keys(draft.reasoningEfforts || {});
  const allowed = entry?.levels ?? LEVELS;
  const change = update => {
    try {
      // Resolve the committed native row again: capacities, renames and removals
      // may have changed since this portal last rendered.
      const current = rowBridge(row.element);
      if (!current || current.disabled) return;
      const next = typeof update === 'function' ? update(current, fields(current.model)) : update;
      validateFields(next);
      current.onChange(applyFields(current.model, next));
      row.refresh();
      setError('');
    } catch (e) {setError(e.message);}
  };
  const add = level => change((current, latest) => {
    const matched = matchModel(current.model.id, current.provider);
    const compat = matched ? autoFields(matched, current.provider.api).compat
      : current.provider.api === 'anthropic-messages' ? {forceAdaptiveThinking: true}
      : current.provider.api === 'openai-completions' ? {supportsReasoningEffort: true} : {};
    return {...latest, defaultReasoningEffort: latest.defaultReasoningEffort ?? level, compat: {...latest.compat, ...compat}, reasoningEfforts: {
      ...(latest.reasoningEfforts || {}), [level]: level === 'off' ? matched?.offValue ?? 'none' : level,
    }};
  });
  const remove = level => change((_current, latest) => {
    const next = {...latest.reasoningEfforts}; delete next[level];
    const remaining = Object.keys(next);
    const enabled = remaining.some(k => k !== 'off');
    return {...latest, reasoningEfforts: enabled ? next : false, defaultReasoningEffort: !enabled ? undefined
      : remaining.includes(latest.defaultReasoningEffort) ? latest.defaultReasoningEffort : chooseDefault(remaining)};
  });
  const match = () => {
    const current = rowBridge(row.element);
    const matched = current && matchModel(current.model.id, current.provider);
    if (matched) change(autoFields(matched, current.provider.api));
  };
  return <div className="dme" aria-label={row.id + ' 思考强度'}>
    <div className="dme-heading"><span>思考强度</span><div className="dme-actions">
      <button type="button" disabled={row.disabled || !entry} onClick={match}>自动匹配</button>
      <button type="button" disabled={row.disabled || same(draft, row.baseline)} onClick={() => change(row.baseline)}>重置</button>
    </div></div>
    <div className="dme-chips" aria-label="已配置的思考档位">
      {LEVELS.filter(k => active.includes(k)).map(k => <span className="dme-chip" key={k} data-default={draft.defaultReasoningEffort === k || undefined}>
        <span className="dme-level">
          {k}{draft.defaultReasoningEffort === k && <span className="dme-default">default</span>}
        </span>
        <button className="dme-set-default" type="button" disabled={row.disabled} aria-label={'设 ' + k + ' 为默认档位'} aria-pressed={draft.defaultReasoningEffort === k}
          title={draft.defaultReasoningEffort === k ? '默认档位' : '设为默认'}
          onClick={() => change((_current, latest) => ({...latest, defaultReasoningEffort: k}))}>
          <span aria-hidden="true">{draft.defaultReasoningEffort === k ? '★' : '☆'}</span>
        </button>
        <button type="button" disabled={row.disabled} aria-label={'删除 ' + k + ' 档位'} onClick={() => remove(k)}>×</button>
      </span>)}
      <select className="dme-add" aria-label="增加思考档位" disabled={row.disabled} value="" onChange={e => add(e.target.value)}>
        <option value="" disabled>＋ 添加档位</option>
        {LEVELS.filter(k => !active.includes(k)).map(k => <option key={k} value={k} disabled={!allowed.includes(k) || k === 'off' && !active.length}>{k}</option>)}
      </select>
    </div>
    {error && <span className="dme-error" role="alert">{error}</span>}
  </div>;
}

function InlineEfforts() {
  const marker = useRef(null), [rows, setRows] = useState([]);
  useEffect(() => observeModelRows(marker.current.closest('[class*="_section"]') ?? marker.current.parentElement, setRows), []);
  return <><span ref={marker} data-dme-owner="" hidden/>{rows.map(row => createPortal(<EffortRow row={row}/>, row.mount, row.key))}</>;
}

export function apply(ctx) {
  const style = document.createElement('style'); style.textContent = css; document.head.append(style);
  ctx.effect(() => () => style.remove());
  ctx.slots.inject('settings.models.footer', () => {
    ctx.slots.register({name: 'settings.models.footer', id: 'model-efforts'}, InlineEfforts);
  });
}
