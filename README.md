# DSH Model Efforts

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的模型思考强度配置插件。支持按模型管理可用档位与默认档位，并根据官方模型目录自动匹配。

![模型思考强度设置](docs/assets/model-efforts.png)

## 功能

- 在模型的上下文窗口和最大输出设置下方编辑思考强度。
- 添加、删除档位，保留 `off`、`low`、`medium`、`high` 等原始英文值。
- 根据模型 ID 和 API 协议自动匹配支持的档位。
- 设置模型默认档位，通过 `default` 标签标识当前选择。
- 重置编辑内容，使用原生服务商编辑器统一保存或取消。

## 安装

要求：Node.js ≥ 22.19.0。已验证的宿主版本为 DSH 0.2.0-rc.2。

从源码构建：

```sh
git clone https://github.com/deepseek-harness-plugins/dsh-model-efforts.git
cd dsh-model-efforts
npm ci
npm run build
npm pack
```

在 DSH 的 **插件 → 添加插件** 中输入生成的 `deepseekharness-plugin-dsh-model-efforts-0.3.1.tgz` 的绝对路径，安装后启用插件。

升级时安装新版同名安装包，保存正在编辑的内容后重新启动 DSH，加载新版客户端。

## 使用

1. 打开 **设置 → 模型**，编辑服务商并展开模型选项。
2. 点击 **自动匹配**，填入该模型支持的档位。未收录的模型可以手动添加档位。
3. 点击档位文字设为默认。当前默认档位显示 `default` 标签。
4. 使用 **添加档位** 或标签右侧的 **×** 调整可用档位。**重置** 恢复本次编辑前的设置。
5. 点击服务商编辑器的 **保存** 应用修改，或点击 **取消** 放弃修改。

### 默认档位

会话中手动选择的档位优先于模型默认档位。模型配置了默认档位后，聊天菜单直接使用具体档位；未设置默认值的模型沿用 DSH 的默认行为。

`off` 表示关闭思考，与表示默认行为的 `Default` 不同。只有支持关闭思考的匹配规则才提供 `off`。

自动匹配优先将 `high` 设为默认，其次为 `medium`，否则选择一个支持的思考档位。此选择是插件的预设策略，可以在界面修改。删除当前默认档位会重新选择；删除全部档位会同时清除默认值。

## 模型支持

模型目录包含 83 个模型 ID、40 条协议规则，覆盖 Anthropic、OpenAI、Google、DeepSeek、Qwen、xAI，以及 QwenCloud 托管的 GLM 和 Kimi。目录核对日期为 2026-10-12。

自动匹配依据模型 ID、API 协议和适用端点。完整档位列表及官方来源见 [模型目录](docs/MODEL-CATALOG.md)。

第三方网关需要支持并透传对应的思考参数。宿主升级后，应重新验证模型编辑器和请求适配的兼容性。

## 开发

```sh
npm ci
npm run build     # 构建插件
npm test          # 运行逻辑测试
npm run test:ui   # 运行 DSH 页面测试
npm run check    # 执行全部检查
```

页面测试需要已安装的 DSH CLI 和 Chrome，运行于隔离的 web profile，并使用本地模拟服务验证请求参数。默认使用 macOS 应用内的 CLI；可通过 `DME_CLI` 指定其他 CLI 路径，通过 `DME_BROWSER` 指定 Playwright 浏览器通道。

验证范围和兼容性说明见 [验证记录](docs/VERIFICATION.md)。

## 贡献

欢迎通过 [Issue](https://github.com/deepseek-harness-plugins/dsh-model-efforts/issues) 报告问题或提交 Pull Request。

新增模型规则时，请在 `src/catalog.js` 中提供准确的模型 ID、支持档位、API 协议和官方文档来源，并生成目录文档：

```sh
node scripts/catalog-doc.mjs
```

行为变更请补充相应测试，并使用约定式提交信息。

## 许可证

[MIT](LICENSE)
