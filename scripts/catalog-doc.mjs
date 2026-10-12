import {writeFile} from 'node:fs/promises';
import {catalog, checkedOn} from '../src/catalog.js';
const ids = new Set(catalog.flatMap(e => e.ids));
const rows = catalog.map(e => `| ${e.vendor} | ${e.ids.map(id => '`'+id+'`').join('<br>')} | ${e.levels.join(' / ')} | ${e.defaultEffort} | ${e.apis.join('<br>')} | ${e.sources.map((s, i) => `[官方${i+1}](${s})`).join(' ')} | ${e.hosts ? '仅 '+e.hosts.join(' / ')+'。' : ''}${e.note ?? ''} |`);
await writeFile('docs/MODEL-CATALOG.md', `# 模型思考档位目录\n\n核对日期：${checkedOn}。${ids.size} 个明确模型 ID（包含已核实的别名和日期版本），${catalog.length} 条协议规则。\n\n此表由 src/catalog.js 生成。off 与 Default 独立，实际关闭参数由协议适配决定；思考档位使用同名接口值。初始默认列是插件的预选档位，可在 UI 修改，不代表厂商 API 的官方默认值。能力目录附官方来源，第三方网关是否兼容需单独验证。托管规则不可推广到其他端点。\n\n| 厂商 / 部署 | 模型 ID | 档位 | 初始默认 | DSH API | 来源 | 说明 |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`);
console.log(JSON.stringify({models: ids.size, rules: catalog.length}));
