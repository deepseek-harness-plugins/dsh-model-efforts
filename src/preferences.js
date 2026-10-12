export const PREFERENCE_KEY = 'dsh-model-efforts.editor.v1';
export const LEGACY_PREFERENCE_KEY = 'dsh-model-efforts.ui.v1';
export const DEFAULT_PREFERENCES = Object.freeze({effortEditor: true});

export function createPreferences(storage) {
  const listeners = new Set();
  const read = () => {
    try {
      const value = JSON.parse(storage.getItem(PREFERENCE_KEY) ?? storage.getItem(LEGACY_PREFERENCE_KEY));
      return {effortEditor: typeof value?.effortEditor === 'boolean' ? value.effortEditor : DEFAULT_PREFERENCES.effortEditor};
    } catch {return DEFAULT_PREFERENCES;}
  };
  let snapshot = Object.freeze(read());
  const publish = next => {
    if (next.effortEditor === snapshot.effortEditor) return;
    snapshot = Object.freeze(next);
    listeners.forEach(fn => fn());
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: fn => {listeners.add(fn); return () => listeners.delete(fn);},
    reload: () => publish(read()),
    update: patch => {
      const next = {...snapshot, ...patch};
      if (!(typeof next.effortEditor === 'boolean')) throw new Error('无效的界面设置');
      storage.setItem(PREFERENCE_KEY, JSON.stringify({effortEditor: next.effortEditor}));
      publish({effortEditor: next.effortEditor});
    },
  };
}
