export const PREFERENCE_KEY = 'dsh-model-efforts.ui.v1';
export const PICKER_STYLES = ['deepseek', 'codex'];
export const DEFAULT_PREFERENCES = Object.freeze({pickerStyle: 'deepseek', effortEditor: true});

export function createPreferences(storage) {
  const listeners = new Set();
  const read = () => {
    try {
      const value = JSON.parse(storage.getItem(PREFERENCE_KEY));
      return {...DEFAULT_PREFERENCES,
        ...(PICKER_STYLES.includes(value?.pickerStyle) ? {pickerStyle: value.pickerStyle} : {}),
        ...(typeof value?.effortEditor === 'boolean' ? {effortEditor: value.effortEditor} : {})};
    } catch {return DEFAULT_PREFERENCES;}
  };
  let snapshot = read();
  const publish = next => {
    if (next.pickerStyle === snapshot.pickerStyle && next.effortEditor === snapshot.effortEditor) return;
    snapshot = Object.freeze(next);
    listeners.forEach(fn => fn());
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: fn => {listeners.add(fn); return () => listeners.delete(fn);},
    reload: () => publish(read()),
    update: patch => {
      const next = {...snapshot, ...patch};
      if (!PICKER_STYLES.includes(next.pickerStyle) || typeof next.effortEditor !== 'boolean') throw new Error('无效的界面设置');
      storage.setItem(PREFERENCE_KEY, JSON.stringify(next));
      publish(next);
    },
  };
}
