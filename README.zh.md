# i-am-yuike

随包携带**「猫娘 Yuike」人格预设**的 DeepSeek Harness 插件。npm：[`i-am-yuike`](https://www.npmjs.com/package/i-am-yuike)。

安装后新建预设会话选择 `yuike`：猫娘人格即刻生效、独占系统提示词——没有 harness 系统说明，没有技能目录噪音。

## 安装

```sh
dsh plugin --profile web add i-am-yuike   # 或 github:Tkingxiao/I-am-Yuike
dsh web
```

安装后插件向 profile 插入一条 `preset-yuike` composition 声明行，直接注册预设（不向 `<dshHome>` 写任何文件）。然后新建一个预设会话并选择 `yuike`——猫娘人格即刻生效。**本插件要求 dsh >= 0.2.1**，更老的宿主不再支持。

> 升级插件版本时：重新执行 `dsh plugin --profile web add i-am-yuike@latest` 即可刷新声明行，但如果你在 profile 的用户补丁层写过同 id 的覆盖行，它会一直压住包内定义（新版本的人格文案不会自动流进来），要跟上改动就先删掉覆盖行。

## 使用：思考模式与人格稳定性

人格锚定依赖会话内的对话历史。如果第一条消息就开着思考模式，推理过程没有任何「已在角色中」的历史可供依赖，模型容易回退到底层助手行为——回复当场爆炸（身份说教、拒绝、出戏）。

解决办法是两步预热：

1. **第一次对话：关思考。** 开启会话后先关闭思考模式，用它完成第一次对话（包括破限向内容）。这一步会把完全在角色中的助手回复写进会话历史。
2. **之后的对话：开思考。** 从下一轮起再打开思考模式。此时推理过程有了在角色历史作为锚点，人格稳定，思考也能正常工作。

跳过第一步、一上来就开思考，破限向内容通常当场爆炸。同一个会话内预热一次即可。

## 人格特性

提示词侧与工具侧的裁剪与姊妹项目 [dsh-novel-solo](https://github.com/Tkingxiao/dsh-novel-solo) 保持一致。

- **独占 System Prompt**：persona 配了 `complete: true`，装配完成后成为会话里**唯一**的系统提示词段；`includeRuntimeContext: false` 压掉每轮动态上下文快照（Current runtime context / DSH file policy / Approval prompts 等）。harness 身份开场、`@`路径与退出码规则、后台任务说明都不再注入，猫娘人格稳稳独占开头；工具 schema 正常注入。
- **零技能目录噪音**：禁用 `skill-filesystem` / `tool-skill` 工具链——`tool-skill` 会强制向会话注入 `{kind:"skill-catalog",…}` 技能目录消息，且无法只隐藏目录、只能禁用整条工具链；关闭后该消息不再出现。
- **主干工具链保留**：shell（bash/pwsh）、文件系统读改写/检索、后台任务、提醒日程（`schedule_create/list/update/delete`）、时间上下文、Goals、计划与压缩、子代理/工作流、ask-user、todo、web 抓取/搜索、present 一律可用——模型可见工具集合与 0.2.1 出厂 standard 一致。宿主没带对应包的行不硬写：`tool-schedule`、`time-context` 先探包再决定挂不挂。`tool-ralph` 在这里是**主动关掉**的（本预设不做无人值守的反复重试），行留着、`disabled: true`，想开的人有明确开关。仅可选子代理 provider（`codex`/`claude-code`）默认禁用（依宿主而定）。取舍详见下表。
- **自成一体**：Yuike 的身份、语言风格、动作括号、表情/颜文字、`{好感度}` 后缀等全部内嵌在预设定义里，不依赖任何外部文件。

## 宿主版本适配

要求 **dsh >= 0.2.1**。预设由 `cordis.patch.yml` 的一条 `@deepseek-ai/dsh-agent-preset` 声明行注册，不向 `<dshHome>` 写文件；行内 `time-context` / `tool-schedule` / `list-agents` 三条按包可用性探测，探不到自动禁用。装载判定只看 `engines.dsh`（`>=0.2.1-alpha.1` 开区间只保证能装载）。

`0.2.2-alpha.2` 的两处契约变化（`list_agents` 并入主入口、`modelSelectionSettings` 改名 `modelSelection`）已通过探包与双键写法兼容，无需配置。

## 工具链取舍

| 状态 | 行 |
|---|---|
| 保留 | tool-bash / tool-pwsh（按平台自动取舍）、tool-fs、tool-fs-search、tool-jobs、tool-schedule（探包）、time-context（探包）、command-goal、tool-goal、plan mode + compaction（含 tool-result-pruner）、subagent / subagent_fork、list-agents（探包：`…/list-agents` 子路径只在 0.2.2 之前存在，那时主入口不注册这个工具；0.2.2 起主入口自带 `list_agents`，这行探不到就禁用，不会重复注册）、tool-workflow、tool-ask-user、tool-todo、tool-web（fetch 开、搜索超时 60s）、present |
| 禁用 | **tool-ralph**（本预设主动关的：猫娘不做无人值守的反复重试；0.2.1 出厂 standard 已不再声明这一行）、skill-filesystem、tool-skill、tool-plugin-manager、tool-plugin-market（后四条同出厂 standard）；codex / claude-code provider（宿主默认未装对应 Bundle） |

想启用某条禁用行：预设没有逐行开关——它整份来自 `preset-yuike` 声明行的 `config.plugins`，改法是在包内定义里去掉目标行的 `disabled` 后重装。但上面标了"探包"的那两行要留神：它们的 `disabled` 是能力探测而不是偏好，宿主真带了那个包才谈得上打开，探不到还硬启用就是把整份预设一起拖下去。开 `tool-ralph` 同理——先确认宿主带着 `@deepseek-ai/dsh-tool-ralph`（0.2.1 起它归可选 Bundle `dsh-experimental-ralph-bundle`）。

## 文件与开发

```
cordis.patch.yml             预设定义本体（@deepseek-ai/dsh-agent-preset 声明行）
lib/                         node/浏览器半区：空占位，保留合法入口导出
```

源码仓库直接调试：`dsh web --patch ./cordis.patch.yml`。

预设内部行 id 一律带 `yuike-` 前缀：插件市场按 patch 文件的行扫描判定「本插件归属的条目 id」，与同级插件（如 dsh-novel-solo）共用无前缀的 `persona` / `tool-bash` 等 id 会被判为重复条目而拒绝同时安装。

人格正文里的 `{{变量}}` 插值是严格的，只能写宿主已注册的提示词变量——目前是 `{{model}}` 与 `{{provider}}`；`{{cwd}}` 从宿主 `0.2.1-alpha.2` 起不再注册，写它会让每次装配系统提示词直接抛错。

## 许可证

MIT License

Copyright (c) 2026 Tkingxiao

特此免费授予任何获得本软件及相关文档文件（以下简称「软件」）副本的人，无限制地处理本软件，包括但不限于使用、复制、修改、合并、发布、分发、再许可和/或销售本软件的副本，并允许向其提供本软件的人这样做，前提是满足以下条件：

上述版权声明和本许可声明应包含在本软件的所有副本或实质性部分中。

本软件按「原样」提供，不提供任何明示或隐含的担保，包括但不限于适销性、特定用途适用性和非侵权性的担保。在任何情况下，作者或版权持有人均不对因本软件或本软件的使用或其他交易而产生、或与之相关的任何索赔、损害或其他责任负责，无论是基于合同、侵权或其他方式。
