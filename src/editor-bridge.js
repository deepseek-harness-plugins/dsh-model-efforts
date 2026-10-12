import {fields} from './core.js';

// DSH 0.2.0-rc.2 exposes a page footer slot but no ModelRow draft slot.
// Keep this version-specific adapter in one file. It calls the existing row's
// onChange; it never mutates a React fiber, draft object, remote or save handler.
function committedFiber(element) {
  const key = Object.keys(element).find(k => k.startsWith('__reactFiber$'));
  let root = key && element[key];
  if (!root) return null;
  while (root.return) root = root.return;
  root = root.stateNode?.current;
  if (!root) return null;
  // The DOM fiber pointer can refer to an alternate. Only traverse the committed
  // tree, so repeated edits cannot call a stale callback and restore old fields.
  const pending = [root];
  while (pending.length) {
    const node = pending.pop();
    if (node.stateNode === element) return node;
    if (node.sibling) pending.push(node.sibling);
    if (node.child) pending.push(node.child);
  }
  return null;
}

export function rowBridge(element) {
  if (!element.isConnected) return null;
  let row, provider, owner;
  for (let node = committedFiber(element); node; node = node.return) {
    const props = node.memoizedProps;
    if (!props) continue;
    if (!row && props.inputField === 'input' && typeof props.model?.id === 'string' && typeof props.onChange === 'function') row = props;
    if (!provider && props.probe?.settingsNs === 'llm-pi-ai') provider = {api: props.probe.api, baseURL: props.probe.baseURL};
    if (!owner && props.namespace?.ns === 'llm-pi-ai' && props.settingsPath && props.schema) owner = props;
  }
  if (!row || !provider) return null;
  return {model: row.model, onChange: row.onChange, disabled: row.disabled, provider,
    savedModels: owner?.schema.getPath(owner.namespace.value, [...owner.settingsPath, 'models']) ?? []};
}

export function observeModelRows(scope, render) {
  const mounted = new Map(), originals = new WeakMap();
  let frame = 0, serial = 0, last = '';
  const refresh = () => {if (!frame) frame = requestAnimationFrame(scan);};
  const scan = () => {
    frame = 0;
    const rows = [], live = new Set();
    for (const element of scope.querySelectorAll('[class*="_modelEntry"]')) {
      const bridge = rowBridge(element);
      if (!bridge) continue;
      const editor = element.closest('[class*="_modelList"]');
      if (!editor) continue;
      if (!originals.has(editor)) originals.set(editor, new Map(bridge.savedModels.map(m => [m.id, fields(m)])));
      const advanced = element.querySelector('[class*="_modelAdvanced"]');
      if (!advanced) continue;
      let seat = mounted.get(element);
      if (!seat || seat.mount.parentElement !== advanced) {
        const mount = document.createElement('div'); mount.className = 'dme-mount';
        advanced.insertBefore(mount, advanced.querySelector('fieldset'));
        seat = {mount, key: ++serial}; mounted.set(element, seat);
      }
      live.add(element);
      rows.push({...seat, element, id: bridge.model.id, fields: fields(bridge.model), provider: bridge.provider,
        baseline: originals.get(editor).get(bridge.model.id) ?? fields({}), disabled: bridge.disabled, refresh});
    }
    for (const [element, seat] of mounted) if (!live.has(element)) {mounted.delete(element); seat.mount.remove();}
    const signature = JSON.stringify(rows.map(({key, id, fields, provider, baseline, disabled}) => ({key, id, fields, provider, baseline, disabled})));
    if (signature !== last) {last = signature; render(rows);}
  };
  const observer = new MutationObserver(refresh);
  observer.observe(scope, {subtree: true, childList: true, attributes: true, attributeFilter: ['disabled']});
  scope.addEventListener('input', refresh, true); scope.addEventListener('change', refresh, true);
  scan();
  return () => {
    observer.disconnect(); cancelAnimationFrame(frame);
    scope.removeEventListener('input', refresh, true); scope.removeEventListener('change', refresh, true);
    for (const seat of mounted.values()) seat.mount.remove();
  };
}
