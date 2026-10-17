<div align="center">

# DSH Model Efforts · 已归档

模型思考强度插件已于 **2026 年 10 月 17 日** 停止维护，改用 DeepSeek Harness 原生推理等级设置。

[![Status](https://img.shields.io/badge/status-archived-8b949e?style=flat-square)](https://github.com/deepseek-harness-plugins/dsh-model-efforts)
[![License: MIT](https://img.shields.io/badge/License-MIT-387dfa?style=flat-square)](LICENSE)

</div>

## 改用 DSH 原生设置

[DeepSeek Harness 0.2.1-rc.2](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-rc.2) 已提供自定义模型的推理等级编辑，可增删档位并设置对应的 API 参数值，无需安装本插件。

打开 **设置 → 模型 → 编辑提供商 → 自定义设置 → 模型选项 → 推理等级**，配置模型支持的档位。

此前插件还提供自动匹配模型目录、指定模型默认档位等功能。本仓库保留相关源码与历史记录供参考，不再发布更新或提供安装指引。

## 已安装用户

打开 **插件 → 模型思考强度 → 卸载**，使用 DSH 自带的推理等级设置继续管理模型档位。卸载插件会移除其扩展界面与默认值处理逻辑，已保存到 DSH 模型目录的档位配置会保留。

[Codex 模型选择器](https://github.com/deepseek-harness-plugins/dsh-codex-picker) 是独立插件，直接读取 DSH 模型目录与推理等级，可以继续使用，无需搭配本插件。

## 历史资料

- [模型目录](docs/MODEL-CATALOG.md)
- [历史验证记录](docs/VERIFICATION.md)
- [维护约定](AGENTS.md)

以上资料反映归档前版本的实现与测试范围。

## 许可证

[MIT](LICENSE)
