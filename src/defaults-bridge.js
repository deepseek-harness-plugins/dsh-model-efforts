// DSH 0.2.0-rc.2 preserves extension fields on model entries, but pi-ai only
// exposes a provider-wide default. Keep this instance adapter isolated here.
// Capture defaults with each native snapshot: a prepared call must not combine
// old capabilities with a new default after Save or hot reload.
export function adaptDefaults(adapter, readDefaults) {
  const snapshots = new WeakMap();
  const originals = new Map();
  const wrappers = new Map();
  const wrap = (key, factory) => {
    const descriptor = Object.getOwnPropertyDescriptor(adapter, key);
    const original = adapter[key];
    originals.set(key, descriptor);
    const wrapped = factory(original);
    wrappers.set(key, wrapped);
    adapter[key] = wrapped;
  };
  const defaultFor = (snapshot, provider, model) => snapshots.get(snapshot)?.get(provider)?.get(model);
  wrap('current', original => function(...args) {
    const snapshot = original.apply(this, args);
    if (!snapshots.has(snapshot)) snapshots.set(snapshot, readDefaults());
    return snapshot;
  });
  wrap('modelInfo', original => function(snapshot, provider, model) {
    const info = original.call(this, snapshot, provider, model);
    const effort = defaultFor(snapshot, provider, model);
    if (effort === undefined) return info;
    if (!info.reasoning?.efforts.some(e => e.id === effort)) throw new Error(`模型 ${provider}/${model} 的默认思考档位 ${effort} 不可用。`);
    return {...info, reasoning: {...info.reasoning, defaultEffort: effort}};
  });
  wrap('streamWithSnapshot', original => function(options, snapshot) {
    const effort = options.reasoningEffort ?? defaultFor(snapshot, options.provider, options.model);
    return original.call(this, effort === undefined ? options : {...options, reasoningEffort: effort}, snapshot);
  });
  return () => {
    for (const [key, descriptor] of originals) if (adapter[key] === wrappers.get(key)) {
      if (descriptor) Object.defineProperty(adapter, key, descriptor);
      else delete adapter[key];
    }
  };
}

export function installDefaults(ctx) {
  const adapted = new Map();
  let active = true;
  const readDefaults = () => {
    const defaults = new Map();
    for (const entry of ctx.configEditor.entries()) {
      if (entry.fiber?.runtime?.name !== 'llm-pi-ai') continue;
      const providers = entry.fiber.config.providers.get();
      for (const [provider, config] of Object.entries(providers)) {
        const models = new Map();
        for (const model of config.models ?? []) if (model.defaultReasoningEffort !== undefined) models.set(model.id, model.defaultReasoningEffort);
        for (const [id, model] of Object.entries(config.modelOverrides ?? {})) if (model.defaultReasoningEffort !== undefined) models.set(id, model.defaultReasoningEffort);
        defaults.set(provider, models);
      }
    }
    return defaults;
  };
  const sync = () => {
    if (!active) return;
    const live = new Set([...ctx.llm.adapters.values()].map(r => r.adapter));
    for (const [adapter, dispose] of adapted) if (!live.has(adapter)) {dispose(); adapted.delete(adapter);}
    for (const adapter of live) {
      if (adapted.has(adapter) || adapter.constructor.name !== 'PiAiAdapter') continue;
      if (['current', 'modelInfo', 'streamWithSnapshot'].every(k => typeof adapter[k] === 'function')) adapted.set(adapter, adaptDefaults(adapter, readDefaults));
    }
  };
  ctx.on('llm/adapters-updated', sync);
  let previousDefaults;
  ctx.on('loader/volatile-update', () => {
    if (!active) return;
    // Native registration facts do not include our extension field. Publish a
    // catalog refresh when only a model's default changes, without polling.
    const signature = JSON.stringify([...readDefaults()].map(([provider, models]) => [provider, [...models]]));
    if (signature === previousDefaults) return;
    previousDefaults = signature;
    ctx.emit('llm/adapters-updated');
  });
  sync();
  ctx.emit('llm/adapters-updated');
  ctx.effect(() => () => {
    active = false;
    for (const dispose of adapted.values()) dispose();
    adapted.clear();
    ctx.emit('llm/adapters-updated');
  });
}
