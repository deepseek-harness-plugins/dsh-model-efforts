import React, {useState, useSyncExternalStore} from 'react';
import {Switch} from '@deepseek-ai/dsh-client-ui-primitives';

export function EffortSettings({preferences}) {
  const settings = useSyncExternalStore(preferences.subscribe, preferences.getSnapshot);
  const [error, setError] = useState('');
  const change = enabled => {
    try {preferences.update({effortEditor: enabled}); setError('');}
    catch (e) {setError('设置未保存：' + e.message);}
  };
  return <section className="dme-settings" aria-label="思考强度设置">
    <div className="dme-setting-row"><span>思考强度设置 UI</span>
      <Switch checked={settings.effortEditor} label="思考强度设置 UI" onChange={change}/>
    </div>
    {error && <p className="dme-error" role="alert">{error}</p>}
  </section>;
}
