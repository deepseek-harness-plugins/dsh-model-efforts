import test from 'node:test';
import assert from 'node:assert/strict';
import {adaptDefaults} from '../src/defaults-bridge.js';

class Adapter {
  snapshot = {};
  current() {return this.snapshot;}
  modelInfo(_snapshot, provider, id) {return {provider, id, reasoning: {efforts: ['off', 'low', 'high'].map(id => ({id, name: id})), defaultEffort: 'high'}};}
  streamWithSnapshot(options, snapshot) {return {options, snapshot};}
}
const map = (a, b = 'off') => new Map([['route', new Map([['a', a], ['b', b]])]]);
test('模型默认值同时作用于目录与实际请求，显式档位优先', () => {
  const adapter = new Adapter();
  const dispose = adaptDefaults(adapter, () => map('low'));
  const snapshot = adapter.current();
  assert.equal(adapter.modelInfo(snapshot, 'route', 'a').reasoning.defaultEffort, 'low');
  assert.equal(adapter.modelInfo(snapshot, 'route', 'b').reasoning.defaultEffort, 'off');
  assert.equal(adapter.streamWithSnapshot({provider: 'route', model: 'a'}, snapshot).options.reasoningEffort, 'low');
  assert.equal(adapter.streamWithSnapshot({provider: 'route', model: 'b'}, snapshot).options.reasoningEffort, 'off');
  assert.equal(adapter.streamWithSnapshot({provider: 'route', model: 'a', reasoningEffort: 'high'}, snapshot).options.reasoningEffort, 'high');
  dispose();
});
test('已准备的请求绑定旧默认值，新配置只影响新快照', () => {
  const adapter = new Adapter();
  let defaults = map('low');
  const dispose = adaptDefaults(adapter, () => defaults);
  const first = adapter.current();
  defaults = map('high'); adapter.snapshot = {};
  const second = adapter.current();
  assert.equal(adapter.streamWithSnapshot({provider: 'route', model: 'a'}, first).options.reasoningEffort, 'low');
  assert.equal(adapter.streamWithSnapshot({provider: 'route', model: 'a'}, second).options.reasoningEffort, 'high');
  dispose();
});
test('不改变未配置模型的宿主行为；禁用插件完整恢复方法', () => {
  const adapter = new Adapter(), originals = ['current', 'modelInfo', 'streamWithSnapshot'].map(k => adapter[k]);
  const dispose = adaptDefaults(adapter, () => map('low'));
  const snapshot = adapter.current(), options = {provider: 'other', model: 'a'};
  assert.equal(adapter.streamWithSnapshot(options, snapshot).options, options);
  assert.equal(adapter.modelInfo(snapshot, 'other', 'a').reasoning.defaultEffort, 'high');
  dispose();
  assert.deepEqual(['current', 'modelInfo', 'streamWithSnapshot'].map(k => adapter[k]), originals);
  assert.equal(Object.hasOwn(adapter, 'modelInfo'), false);
});
test('拒绝无法使用的默认值，避免目录宣告错误能力', () => {
  const adapter = new Adapter(), dispose = adaptDefaults(adapter, () => map('max'));
  assert.throws(() => adapter.modelInfo(adapter.current(), 'route', 'a'), /不可用/);
  dispose();
});
