# 模型思考档位目录

核对日期：2026-10-12。83 个明确模型 ID（包含已核实的别名和日期版本），40 条协议规则。

此表由 src/catalog.js 生成。off 与 Default 独立，实际关闭参数由协议适配决定；思考档位使用同名接口值。初始默认列是插件的预选档位，可在 UI 修改，不代表厂商 API 的官方默认值。能力目录附官方来源，第三方网关是否兼容需单独验证。托管规则不可推广到其他端点。

| 厂商 / 部署 | 模型 ID | 档位 | 初始默认 | DSH API | 来源 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| Anthropic | `claude-fable-5-1`<br>`claude-mythos-5-1`<br>`claude-fable-5`<br>`claude-mythos-5`<br>`claude-opus-5-5`<br>`claude-opus-5`<br>`claude-opus-4-8`<br>`claude-opus-4-7`<br>`claude-sonnet-5-5`<br>`claude-sonnet-5`<br>`claude-haiku-5-5` | low / medium / high / xhigh / max | high | anthropic-messages | [官方1](https://platform.claude.com/docs/en/build-with-claude/effort) | 使用自适应思考；不额外提供关闭档位。 |
| Anthropic | `claude-mythos-preview`<br>`claude-opus-4-6`<br>`claude-sonnet-4-6` | low / medium / high / max | high | anthropic-messages | [官方1](https://platform.claude.com/docs/en/build-with-claude/effort) | 使用自适应思考；不额外提供关闭档位。 |
| OpenAI | `gpt-6-astra` | low / medium / high / xhigh / max | high | openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-6-astra) | DSH 需要工具调用，因此仅自动适配 Responses。 |
| OpenAI | `gpt-6.1-sol` | low / medium / high / xhigh / max | high | openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-6.1-sol) | 工具调用需要 Responses；不支持 none / minimal。 |
| OpenAI | `gpt-6-sol` | off / low / medium / high / xhigh / max | high | openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-6-sol) | 带思考的工具调用需要 Responses。 |
| OpenAI | `gpt-6-luna` | off / low / medium / high / xhigh / max | high | openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-6-luna) | 带思考的工具调用需要 Responses。 |
| OpenAI | `gpt-5.6-sol`<br>`gpt-5.6` | off / low / medium / high / xhigh / max | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.6-sol) |  |
| OpenAI | `gpt-5.6-terra` | off / low / medium / high / xhigh / max | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.6-terra) |  |
| OpenAI | `gpt-5.6-luna` | off / low / medium / high / xhigh / max | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.6-luna) |  |
| OpenAI | `gpt-5.5`<br>`gpt-5.5-2026-04-23` | off / low / medium / high / xhigh | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.5) |  |
| OpenAI | `gpt-5.4`<br>`gpt-5.4-2026-03-05` | off / low / medium / high / xhigh | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.4) |  |
| OpenAI | `gpt-5.4-mini`<br>`gpt-5.4-mini-2026-03-17` | off / low / medium / high / xhigh | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.4-mini) |  |
| OpenAI | `gpt-5.4-nano`<br>`gpt-5.4-nano-2026-03-17` | off / low / medium / high / xhigh | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.4-nano) |  |
| OpenAI | `gpt-5.3-codex` | low / medium / high / xhigh | high | openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.3-codex) |  |
| OpenAI | `gpt-5.2-codex` | low / medium / high / xhigh | high | openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.2-codex) |  |
| OpenAI | `gpt-5.2`<br>`gpt-5.2-2025-12-11` | off / low / medium / high / xhigh | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.2) |  |
| OpenAI | `gpt-5.2-pro`<br>`gpt-5.2-pro-2025-12-11` | medium / high / xhigh | high | openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.2-pro) |  |
| OpenAI | `gpt-5.1`<br>`gpt-5.1-2025-11-13` | off / low / medium / high | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5.1) |  |
| OpenAI | `gpt-5`<br>`gpt-5-2025-08-07` | minimal / low / medium / high | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5) |  |
| OpenAI | `gpt-5-mini`<br>`gpt-5-mini-2025-08-07`<br>`gpt-5-nano`<br>`gpt-5-nano-2025-08-07` | minimal / low / medium / high | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5) |  |
| OpenAI | `gpt-5-pro`<br>`gpt-5-pro-2025-10-06` | high | high | openai-responses | [官方1](https://developers.openai.com/api/docs/models/gpt-5-pro) |  |
| OpenAI | `o3`<br>`o3-2025-04-16`<br>`o4-mini`<br>`o4-mini-2025-04-16` | low / medium / high | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/cookbook/examples/partners/model_selection_guide/model_selection_guide) | 历史模型；档位依据官方已归档的模型指南。 |
| OpenAI | `o3-mini`<br>`o3-mini-2025-01-31` | low / medium / high | high | openai-completions<br>openai-responses | [官方1](https://developers.openai.com/cookbook/examples/object_oriented_agentic_approach/secure_code_interpreter_tool_for_llm_agents) |  |
| OpenAI | `gpt-oss-120b` | low / medium / high | high | openai-completions | [官方1](https://developers.openai.com/api/docs/models/gpt-oss-120b) | 所用推理服务须支持将 reasoning_effort 转为 Harmony 的推理指令。 |
| OpenAI | `gpt-oss-20b` | low / medium / high | high | openai-completions | [官方1](https://developers.openai.com/api/docs/models/gpt-oss-20b) | 所用推理服务须支持将 reasoning_effort 转为 Harmony 的推理指令。 |
| Google | `gemini-3.8-flash` | low / medium / high | high | openai-completions | [官方1](https://ai.google.dev/gemini-api/docs/openai) [官方2](https://ai.google.dev/gemini-api/docs/thinking) |  |
| Google | `gemini-3.6-flash`<br>`gemini-3.5-flash-lite`<br>`gemini-3-flash-preview` | minimal / low / medium / high | high | openai-completions | [官方1](https://ai.google.dev/gemini-api/docs/openai) [官方2](https://ai.google.dev/gemini-api/docs/thinking) |  |
| Google | `gemini-3.1-pro-preview` | low / medium / high | high | openai-completions | [官方1](https://ai.google.dev/gemini-api/docs/openai) [官方2](https://ai.google.dev/gemini-api/docs/thinking) |  |
| Google | `gemini-3-pro-preview` | low / high | high | openai-completions | [官方1](https://ai.google.dev/gemini-api/docs/openai) [官方2](https://ai.google.dev/gemini-api/docs/thinking) |  |
| Google | `gemini-2.5-pro` | low / medium / high | high | openai-completions | [官方1](https://ai.google.dev/gemini-api/docs/openai) [官方2](https://ai.google.dev/gemini-api/docs/thinking) | OpenAI 兼容接口把档位映射为 token 预算；不是原生固定档位。 |
| Google | `gemini-2.5-flash`<br>`gemini-2.5-flash-lite` | off / low / medium / high | high | openai-completions | [官方1](https://ai.google.dev/gemini-api/docs/openai) [官方2](https://ai.google.dev/gemini-api/docs/thinking) | OpenAI 兼容接口把档位映射为 token 预算；不是原生固定档位。 |
| DeepSeek | `deepseek-flash`<br>`deepseek-v4-pro`<br>`deepseek-v4-flash`<br>`deepseek-v4-flash-vision-exp` | off / low / high / max | high | openai-completions<br>openai-responses | [官方1](https://api-docs.deepseek.com/api/list-models/) [官方2](https://api-docs.deepseek.com/) | 旧 Flash ID 在官方接口会路由到 V4.1-Flash。 |
| Qwen | `qwen3.8-max`<br>`qwen3.8-max-0902`<br>`qwen3.8-flash`<br>`qwen3.8-27b`<br>`qwen3.8-omni-flash` | off / low / medium / xhigh | medium | openai-completions | [官方1](https://docs.qwencloud.com/api-reference/chat/openai-chat) | 去掉映射为同一档的兼容别名；不可同时设置 thinking_budget。 |
| Qwen | `qwen3.8-2.4t-a95b` | low / medium / xhigh | medium | openai-completions | [官方1](https://docs.qwencloud.com/api-reference/chat/openai-chat) | 该模型仅有思考模式；不可同时设置 thinking_budget。 |
| GLM（QwenCloud） | `glm-5.2`<br>`glm-5.1`<br>`glm-5` | high / max | high | openai-completions | [官方1](https://docs.qwencloud.com/api-reference/chat/openai-chat) | 仅 dashscope.aliyuncs.com / dashscope-intl.aliyuncs.com / dashscope.qwen.ai / dashscope-us.aliyuncs.com / dashscope-eu.aliyuncs.com。这条规则仅适用于 QwenCloud / DashScope 托管接口。 |
| GLM（QwenCloud） | `glm-5.3`<br>`ZHIPU/GLM-5.3` | low / high / max | high | openai-completions | [官方1](https://docs.qwencloud.com/api-reference/chat/openai-chat) | 仅 dashscope.aliyuncs.com / dashscope-intl.aliyuncs.com / dashscope.qwen.ai / dashscope-us.aliyuncs.com / dashscope-eu.aliyuncs.com。这条规则仅适用于 QwenCloud / DashScope 托管接口。 |
| Kimi（QwenCloud） | `kimi-k3` | off / low / high / max | high | openai-completions | [官方1](https://docs.qwencloud.com/api-reference/chat/openai-chat) | 仅 dashscope.aliyuncs.com / dashscope-intl.aliyuncs.com / dashscope.qwen.ai / dashscope-us.aliyuncs.com / dashscope-eu.aliyuncs.com。这条规则仅适用于 QwenCloud / DashScope 托管接口。 |
| Kimi（QwenCloud） | `kimi/kimi-k3` | max | max | openai-completions | [官方1](https://docs.qwencloud.com/api-reference/chat/openai-chat) | 仅 dashscope.aliyuncs.com / dashscope-intl.aliyuncs.com / dashscope.qwen.ai / dashscope-us.aliyuncs.com / dashscope-eu.aliyuncs.com。这条规则仅适用于 QwenCloud / DashScope 托管接口。 |
| xAI | `grok-4.7`<br>`grok-4.6` | low / medium / high / xhigh | high | openai-completions<br>openai-responses | [官方1](https://docs.x.ai/developers/model-capabilities/text/reasoning) |  |
| xAI | `grok-4.5` | low / medium / high | high | openai-completions<br>openai-responses | [官方1](https://docs.x.ai/developers/model-capabilities/text/reasoning) |  |
