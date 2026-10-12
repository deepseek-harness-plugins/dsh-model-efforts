import React, {useState, useSyncExternalStore} from 'react';
import {Switch} from '@deepseek-ai/dsh-client-ui-primitives';

export function EffortSettings({preferences}) {
  const settings = useSyncExternalStore(preferences.subscribe, preferences.getSnapshot);
  const [error, setError] = useState('');
  const change = patch => {
    try {preferences.update(patch); setError('');}
    catch (e) {setError('设置未保存：' + e.message);}
  };
  return <section className="dme-settings" aria-label="模型与思考强度设置">
    <div className="dme-setting-rows">
      <div className="dme-setting-row"><span id="dme-picker-label">模型选择器</span>
        <div className="dme-segmented" role="radiogroup" aria-labelledby="dme-picker-label">
          {[['deepseek', 'DeepSeek 默认'], ['codex', 'Codex']].map(([value, label]) => <label key={value}>
            <input type="radio" name="dme-picker-style" value={value} checked={settings.pickerStyle === value}
              onChange={() => change({pickerStyle: value})}/><span>{label}</span>
          </label>)}
        </div>
      </div>
      <div className="dme-setting-row"><span>思考强度设置 UI</span>
        <Switch checked={settings.effortEditor} label="思考强度设置 UI" onChange={enabled => change({effortEditor: enabled})}/>
      </div>
    </div>
    {error && <p className="dme-error" role="alert">{error}</p>}
  </section>;
}
