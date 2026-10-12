# DSH Model Efforts

在每个模型的“上下文窗口 / 最大输出 token 数”下方增加思考强度设置。

![模型内的思考强度设置](docs/assets/model-efforts.png)

## 使用

1. 打开 **设置 → 模型 → 编辑服务商 → 展开模型选项**。
2. 点击“自动匹配”填入官方支持的档位；档位直接显示 `low`、`medium`、`high` 等英文值。标签上的 × 删除档位，“添加档位”增加档位。
3. 点击档位文字设为该模型的默认档位，小圆点标记当前默认值。
4. 使用服务商原有的“保存”或“取消”。“重置”恢复该模型打开编辑器时的档位和默认值。

界面只包含档位、添加、自动匹配、重置。无独立面板、模型选择器、保存按钮或说明区。新模型可以直接配置后一起保存，无需先保存一次。已收录模型限制在匹配规则的档位范围内；未知模型可手动添加。删除全部档位会声明该模型没有可选档位。尚无匹配规则时“自动匹配”禁用。

保存明确的默认档位后，聊天菜单直接显示具体档位，不再提供 `Default`；手动选择其他档位优先于默认值。`off` 是独立关闭选项，不能用 `Default` 代替。没有设置默认值的旧配置继续使用宿主默认行为，可以点击一个现有档位再保存。已有会话的手动选择保留。

自动匹配的初始默认值集中维护在模型目录，优先选 `high`，其次 `medium`，否则选一个支持的思考档位。这是插件的初始选择，不代表厂商 API 的官方默认值。删除当前默认档位时会从剩余思考档位重新选择；删除全部档位会同时清除默认值。

## 安装

当前版本 **0.3.0**，已验证 DSH **0.2.0-rc.2**。需要 Node.js **22.19.0** 或更新版本。

从源码构建安装包：

```sh
git clone https://github.com/deepseek-harness-plugins/dsh-model-efforts.git
cd dsh-model-efforts
npm ci
npm run build
npm pack
```

在 DSH 的 **插件 → 添加插件** 中填入生成的 `deepseekharness-plugin-dsh-model-efforts-0.3.0.tgz` 的绝对路径，并启用插件。已安装旧版时升级同名插件，然后重新打开模型设置。

## 模型目录

目录集中维护在 `src/catalog.js`，核对日期为 **2026-10-12**：83 个明确 ID，40 条协议规则。包含 Anthropic、OpenAI、Google、DeepSeek、Qwen、xAI，以及限定 QwenCloud 端点的 GLM、Kimi。完整支持范围和官方来源见 [模型目录](docs/MODEL-CATALOG.md)。

只精确匹配已核实的模型 ID、接口协议和适用端点，不从名称猜测新版本能力。例如 Opus 5.5 自动匹配五档，Sonnet 4.6 只有四档。匹配会一起填写 Claude 自适应思考或 OpenAI 兼容参数格式。第三方网关是否接受并透传参数仍由其实现决定，插件不调用付费服务探测能力。

## 开发与验证

```sh
npm ci
npm run check
npm pack
```

逻辑测试验证目录、协议范围、字段保留、默认值校验、快照一致性和禁用恢复。真实 DSH 页面测试验证嵌入位置、增删、自动匹配、重置、保存、取消，以及容量修改、模型改名、添加和删除后的正确对应。本地模拟 Anthropic 服务核对默认 `medium`、手动覆盖 `max` 以及 `off` 的明确关闭参数；禁用插件后恢复宿主的 `Default`。详见 [验证记录](docs/VERIFICATION.md)。

页面测试需要已安装的 DSH CLI 和系统 Chrome，使用隔离的 web profile，不修改日常 desktop profile。默认使用 macOS 应用内的 CLI；其他安装位置通过 `DME_CLI` 指定，可通过 `DME_BROWSER` 指定 Playwright 通道。React 由 DSH 共享提供，插件客户端约 17 KB，服务端约 4 KB。

## 适配方式

DSH 当前只有页面和服务商级别的扩展插槽，没有单模型的编辑草稿插槽。插件从官方 `settings.models.footer` 插槽挂载，用 React portal 将控件放到模型展开区。版本适配集中在 `src/editor-bridge.js`：读取当前已提交的 ModelRow 回调，调用原有 `onChange` 更新原生草稿。档位、容量等字段随原来的同一次保存提交；取消、校验失败、只读和 revision 冲突均由原编辑器处理。

这一小层适配依赖 DSH 0.2.0-rc.2 的模型 DOM 类和 React 组件属性，升级 DSH 时需要复核。没有修改宿主文件或 React 内部状态，也没有独立配置写入、后台服务或轮询。

模型默认值作为 `defaultReasoningEffort` 扩展字段保存在同一模型条目中，DSH 0.2.0-rc.2 会保留它。`src/defaults-bridge.js` 对注册的 PiAiAdapter 实例提供局部适配：将默认值同时用于模型元数据和请求，并与原生配置快照绑定；显式档位优先。仅默认值修改时也会通知目录刷新。禁用插件会恢复实例原方法和原生目录行为，存储字段保留供再次启用；不改变 DeepSeek 原生适配器。
