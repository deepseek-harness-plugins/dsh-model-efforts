import {installDefaults} from './defaults-bridge.js';
export const name = 'model-efforts';
export const inject = ['llm', 'configEditor'];
export function apply(ctx) {installDefaults(ctx);}
