import React, {useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {pickerModel, modelSelection} from './picker-model.js';

function Chevron() {
  return <svg className="dme-chevron" aria-hidden="true" width="12" height="12" viewBox="0 0 16 16"><path d="m6 3 5 5-5 5"/></svg>;
}
const Check = () => <svg className="dme-check" aria-hidden="true" width="16" height="16" viewBox="0 0 20 20"><path d="m4 10 4 4 8-10"/></svg>;

function usePopover(open, pane, trigger, panel, close) {
  const [position, setPosition] = useState(null);
  useLayoutEffect(() => {
    if (!open) {setPosition(null); return;}
    const place = () => {
      const anchor = trigger.current.getBoundingClientRect(), width = panel.current.offsetWidth;
      const above = anchor.top - 8, below = innerHeight - anchor.bottom - 8;
      const opensAbove = above >= below;
      const next = {left: Math.max(12, Math.min(innerWidth - width - 12, anchor.left + anchor.width / 2 - width / 2)),
        ...(opensAbove ? {bottom: innerHeight - anchor.top + 8} : {top: anchor.bottom + 8}),
        maxHeight: Math.max(64, Math.min(360, (opensAbove ? above : below) - 12)),
        transformOrigin: opensAbove ? 'bottom center' : 'top center'};
      setPosition(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    place();
    const observer = new ResizeObserver(place); observer.observe(panel.current); observer.observe(trigger.current);
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    return () => {observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true);};
  }, [open, pane]);
  useEffect(() => {
    if (!open) return;
    const outside = event => {if (!trigger.current?.contains(event.target) && !panel.current?.contains(event.target)) close(false);};
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, close]);
  return position;
}

function EffortSlider({levels, effort, busy, onSelect, modelName, onModels}) {
  const hostIndex = levels.findIndex(level => level.id === effort);
  const [index, setIndex] = useState(Math.max(0, hostIndex));
  const [isDragging, setDragging] = useState(false);
  const dragging = useRef(false), draft = useRef(index);
  useEffect(() => {if (!dragging.current) {setIndex(Math.max(0, hostIndex)); draft.current = Math.max(0, hostIndex);}}, [hostIndex, busy]);
  const selected = levels[index];
  const highest = levels.length > 1 && index === levels.length - 1 && selected.id !== 'off' && selected.id !== undefined;
  const fraction = levels.length > 1 ? index / (levels.length - 1) : 0;
  const commit = () => {if (levels[draft.current]?.id !== effort) onSelect(levels[draft.current].id);};
  const title = dragging.current || hostIndex >= 0 ? selected.label : effort ?? 'Default';
  return <div className="dme-codex-effort" data-highest={highest || undefined} data-dragging={isDragging || undefined} data-minimum={index === 0 || undefined}>
    <button type="button" className="dme-model-link" onClick={onModels}>
      <span className="dme-effort-title" aria-live="polite"><span key={title}>{title}</span></span>
      <span className="dme-current-model">{modelName}<Chevron/></span>
    </button>
    <div className="dme-rail" style={{'--dme-progress': fraction}}>
      <div className="dme-rail-fill"/>
      <div className="dme-ticks" aria-hidden="true">{levels.map((level, n) => <i key={level.key} data-filled={n <= index || undefined} style={{left: `${levels.length > 1 ? n / (levels.length - 1) * 100 : 0}%`}}/>)}</div>
      {highest && <div className="dme-particles" aria-hidden="true">{Array.from({length: 18}, (_, n) => <i key={n} style={{left: `${5 + (n * 37 % 89)}%`, top: `${20 + n * 23 % 60}%`, width: `${n % 5 === 0 ? 2.5 : 1.5}px`, height: `${n % 5 === 0 ? 2.5 : 1.5}px`, animationDelay: `${-n * .31}s`, animationDuration: `${2.4 + n % 4 * .6}s`}}/>)}</div>}
      <div className="dme-slider-thumb" aria-hidden="true"/>
      <input type="range" aria-label="思考强度" aria-valuetext={selected.label} min="0" max={levels.length - 1} step="1" value={index}
        disabled={busy || levels.length < 2}
        onPointerDown={e => {dragging.current = true; setDragging(true); e.currentTarget.setPointerCapture(e.pointerId);}}
        onChange={e => {draft.current = Number(e.target.value); setIndex(draft.current); if (!dragging.current) commit();}}
        onPointerUp={() => {dragging.current = false; setDragging(false); commit();}}
        onPointerCancel={() => {dragging.current = false; setDragging(false); setIndex(Math.max(0, hostIndex)); draft.current = Math.max(0, hostIndex);}}
        onBlur={() => {if (dragging.current) {dragging.current = false; setDragging(false); commit();}}}/>
    </div>
  </div>;
}

export function CodexPicker({locked, available, directory, load, select}) {
  const state = useSyncExternalStore(fn => directory.subscribe(fn), () => directory.getSnapshot());
  const {choices, current, levels, effort, label} = pickerModel(state);
  const [open, setOpen] = useState(false), [pane, setPane] = useState('root'), [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const trigger = useRef(null), panel = useRef(null), content = useRef(null), id = useId();
  const [height, setHeight] = useState(null);
  const busy = locked || state.pending !== null;
  const close = (focus = true) => {setOpen(false); if (focus) trigger.current?.focus();};
  const position = usePopover(open, pane, trigger, panel, close);
  useEffect(() => {if (available) load();}, [directory, available]);
  useEffect(() => {if (locked || !available) close(false);}, [locked, available]);
  const commit = async (selection, keepOpen = false) => {
    setError('');
    try {
      const result = await select(selection);
      if (result?.ok === false) {setError(result.error.message); return;}
      if (!keepOpen) close();
    } catch (e) {setError(e.message);}
  };
  const selectEffort = value => {
    if (!current || busy) return;
    commit({provider: current.provider, model: current.model.id,
      ...(value === undefined ? {} : {reasoningEffort: value})}, true);
  };
  const modelPane = pane === 'models' || !levels.length;
  const visible = choices.filter(choice => `${choice.model.name} ${choice.model.id} ${choice.providerName}`.toLowerCase().includes(query.toLowerCase()));
  useLayoutEffect(() => {
    if (!open) {setHeight(null); return;}
    const measure = () => {
      const computed = getComputedStyle(panel.current);
      const padding = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom)
        + parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
      // Layout height excludes the popup's entrance transform. Measuring visual
      // bounds during scale-in underestimates the panel and creates overflow.
      setHeight(Math.ceil(content.current.offsetHeight + padding));
    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(content.current);
    return () => observer.disconnect();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const target = content.current.querySelector('input[type="range"], input[type="search"], [aria-checked="true"], [role="menuitemradio"], button');
    target?.focus({preventScroll: true});
    // Reveal the focused item after the height transition, so a growing model
    // menu does not scroll its header away while it is still slider-sized.
    let live = true, frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(async () => {
        if (!live || !panel.current) return;
        await Promise.all(panel.current.getAnimations({subtree: true})
          .filter(animation => animation.effect.getTiming().iterations !== Infinity)
          .map(animation => animation.finished.catch(() => {})));
        if (live && target?.isConnected) target.scrollIntoView({block: 'nearest'});
      });
    });
    return () => {live = false; cancelAnimationFrame(frame);};
  }, [open, pane]);
  const goBack = () => {setPane('root'); setQuery('');};
  const onKeyDown = event => {
    if (event.key === 'Escape') {event.preventDefault(); event.stopPropagation(); pane !== 'root' ? goBack() : close();}
    if (event.key === 'Tab') {close(false); return;}
    if (event.target.matches('input')) return;
    const items = [...panel.current.querySelectorAll('button:not(:disabled)')];
    const index = items.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length : event.key === 'ArrowUp' ? (index - 1 + items.length) % items.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
    if (next !== null && items[next]) {event.preventDefault(); items[next].focus({preventScroll: true}); items[next].scrollIntoView({block: 'nearest'});}
    if (event.key === 'ArrowLeft' && pane !== 'root') {event.preventDefault(); goBack();}
  };
  const failures = state.failures ?? [];
  const loadError = state.error?.message;
  return <>
    <button ref={trigger} type="button" className="dme-picker-trigger dme-picker-codex" aria-label={`选择模型 ${current?.model.name ?? ''} ${label}`.trim()}
      aria-expanded={open} aria-controls={open ? id : undefined} aria-haspopup="dialog" disabled={busy || !available}
      onClick={() => {setOpen(!open); setPane('root'); setQuery(''); setError(''); if (!open) load();}}>
      <span>{current?.model.name ?? '选择模型'}</span>{label && <span className="dme-trigger-effort">{label}</span>}<Chevron/>
    </button>
    {open && createPortal(<div ref={panel} id={id} className="dme-picker-panel dme-picker-codex" role="dialog" aria-label="模型与思考强度"
      data-pane={modelPane ? 'models' : pane} style={{...(position ?? {visibility: 'hidden'}), ...(height === null ? {} : {height})}} onKeyDown={onKeyDown}>
      <div ref={content} className="dme-picker-content"><div key={pane} className="dme-picker-pane">
      {!modelPane ? <EffortSlider levels={levels} effort={effort} busy={busy}
        modelName={current.model.name} onSelect={selectEffort} onModels={() => {setPane('models'); setQuery('');}}/> : <>
          <div className="dme-model-header">
            <div className="dme-picker-heading">选择模型</div>
            {choices.length > 8 && <input className="dme-model-search" type="search" placeholder="搜索模型" aria-label="搜索模型" value={query} onChange={e => setQuery(e.target.value)}/>}
          </div>
          <div className="dme-model-list" role="menu" aria-label="模型">
            {visible.map(choice => <button type="button" key={JSON.stringify([choice.provider, choice.model.id])} role="menuitemradio"
              aria-label={choice.model.name} aria-description={choice.providerName || choice.provider}
              aria-checked={choice.selected} disabled={busy} onClick={() => commit(modelSelection(choice))}>
              <span className="dme-model-name">{choice.model.name}
                <small>{choice.providerName || choice.provider}</small>
              </span>{choice.selected && <Check/>}
            </button>)}
            {!visible.length && <span className="dme-picker-empty">{state.status === 'loading' ? '正在加载…' : query ? '没有匹配的模型' : '没有可用模型'}</span>}
          </div>
      </>}
      </div>
      {(error || loadError || failures.length > 0) && <div className="dme-picker-error" role="alert">
        <span>{error || loadError || failures.map(failure => failure.error?.message ?? failure.message ?? '模型目录加载失败').join('；')}</span>
        {!error && <button type="button" onClick={load}>重试</button>}
      </div>}
      </div>
    </div>, document.body)}
  </>;
}

export function installPicker(ctx, preferences) {
  const name = 'conversation.input.model', registrations = new Map(), decorated = new WeakSet();
  const decorate = () => {
    const entries = ctx.slots.entries(name);
    for (const [entry, release] of registrations) if (!entries.includes(entry)) {registrations.delete(entry); release();}
    for (const entry of entries) {
      // Shadow only DSH's native model seat. Other picker plugins retain their
      // own priority and the original entry keeps its injection/cache identity.
      if (entry.locale !== 'model' || (entry.options.priority ?? 0) !== 0 || decorated.has(entry.component) || registrations.has(entry)) continue;
      const Native = entry.component;
      function Picker(props) {
        const settings = useSyncExternalStore(preferences.subscribe, preferences.getSnapshot);
        return settings.pickerStyle === 'deepseek' ? <Native {...props}/>
          : <CodexPicker {...props}/>;
      }
      decorated.add(Picker);
      registrations.set(entry, () => {});
      const release = ctx.slots.register({name, ...entry.options, priority: -1, inject: entry.inject, locale: entry.locale, store: entry.store}, Picker);
      registrations.set(entry, release);
    }
  };
  ctx.slots.inject(name, decorate);
  const off = ctx.on('slots/changed', changed => {if (changed === name) decorate();});
  ctx.effect(() => () => {off(); for (const release of [...registrations.values()].reverse()) release(); registrations.clear();});
}
