# i-am-yuike

随包携带**「猫娘 Yuike」人格预设**的 DeepSeek Harness 插件。npm：[`i-am-yuike`](https://www.npmjs.com/package/i-am-yuike)。

安装后新建预设会话选择 `yuike`：猫娘人格即刻生效、独占系统提示词——没有 harness 系统说明，没有技能目录噪音。

## 安装

```sh
dsh plugin --profile web add i-am-yuike   # 或 github:Tkingxiao/I-am-Yuike
dsh web
```

补丁行按宿主版本自动取舍：**dsh >= 0.1.7** 上 `preset-yuike` composition 行直接注册预设（不向 `<dshHome>` 写任何文件）；**dsh 0.1.6** 上插件把 `template/` 里的预设**幂等铺设**到 `<dshHome>/.agent-presets/yuike/`（目标已存在则跳过，绝不覆盖你已编辑的预设）。然后新建一个预设会话并选择 `yuike`——猫娘人格即刻生效。

> 升级插件版本时：0.1.7 上重新执行 `dsh plugin --profile web add i-am-yuike@latest` 即可刷新声明行，但如果你在 profile 的用户补丁层写过同 id 的覆盖行，它会一直压住包内定义（新版本的人格文案不会自动流进来），要跟上改动就先删掉覆盖行；0.1.6 上需删除 `<dshHome>/.agent-presets/yuike`（或设 `DSH_YUIKE_REDEPLOY=1`）以拉取最新改动，幂等铺设不会自动覆盖已存在的副本。

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
- **两份定义、一份人格**：0.1.7+ 用 `cordis.patch.yml` 的 `preset-yuike` 行；0.1.6 回退路径把同样内容随包携带为 `template/agent.cordis.yml`（人格 + 工具链接线）与 `template/preset.yml`（名称/描述元数据）。两边只差一件事：template 冻结在 0.1.6 出厂的行集合——`@deepseek-ai/dsh-tool-schedule` 这个包 0.2.1-alpha.1 才存在，`@deepseek-ai/dsh-time-context` 在 0.1.6 也还没进 web Bundle 的依赖表，写在 template 里等于给那条路径服务的宿主挂一个解析不到的包，后果是整份预设报废。人格文本、工具配置、plan-mode 提示词这些仍要求逐字同步。

## 宿主版本适配

| 宿主 | 生效方式 | 升级插件时 |
|---|---|---|
| **>= 0.1.7** | `cordis.patch.yml` 中的 `@deepseek-ai/dsh-agent-preset` 声明行；不向 `<dshHome>` 写文件 | `dsh plugin --profile web add i-am-yuike@latest` 刷新；同名 id 的用户补丁行会一直覆盖本声明行，要跟上新改动先删掉自己的覆盖行 |
| **0.1.6** | node 半区把 `template/` 幂等铺设到 `<dshHome>/.agent-presets/yuike/`（已存在不覆盖） | 删除该目录或设 `DSH_YUIKE_REDEPLOY=1` |

两条行在同一份 patch 里由同一个版本探测表达式互斥门控（经 loader 的 `profileContext.installAnchor` 读宿主自身 `package.json` 的版本），任一时刻只有一条在对应宿主上生效，`>= 0.1.7` 这一支覆盖 0.2.0 及其上的所有版本。宿主升到 0.1.7 后，旧路径留下的 `.agent-presets/yuike` 目录会被直接忽略，可手动删除。

插件到底能不能加载，判定发生得更早、在它的代码跑起来之前：从宿主 `0.1.7-rc.1` 起，profile 组装时会拿 `peerDependencies` 里每一个 `@deepseek-ai/dsh*` 范围去比对当前版本，对不上就整行禁用；从 `0.2.1-alpha.4` 起改成先看 `engines.dsh`——只要写了它，就只由它决定，`peerDependencies` 不再参与（两条规则都在 `0.2.1-alpha.3` 与 `0.2.1-rc.2` 的宿主代码上实测过）。所以两份清单都留着：从 `0.1.6-alpha.1` 一路点名到 `0.2.1-rc.2`，再以 `>=0.1.7-alpha.1` 开区间收尾、不写上界——因为本插件不绑定任何特定宿主构建：走哪条路由它自己的版本探测在装载时才决定，所以一个没核对过的版本也该照常把预设跑起来，而不是被一道失败即关的检查整个挡掉。开区间之前被点名的版本才是真正比对过的——`0.2.0-rc.1`、`0.2.1-alpha.3`、`0.2.1-rc.2` 是两插件同时装、同时起 web 跑过的（`--dump-config` 里两条声明行与 roster id 都在，没有整行被禁用）；`0.1.7-rc.2`、`0.2.0-rc.2`、`0.2.1-alpha.1` 读的是那几个版本的宿主源码、没有实跑：预设行的字段与 `0.1.7-rc.1` 相比没变，本预设所依据的 `standard` 出厂预设只多了出厂自己新加的三行（`time-context`、`tool-schedule`、`plugin-market/tools`），而这三行本包现在都带上了——前两行按包可用性探测，早于它们的宿主就只是少这两个工具，不会连累预设；它引用到的东西一样也没被改名或删除。开区间承诺的是能加载，不是契约变更也坏不了——真出了那样的事，改的是 `cordis.patch.yml`，不是范围。装到此前拒绝本插件的宿主上要重启 `dsh web`，因为这个判定发生在 profile 组装阶段。那份 `engines.dsh` 清单同时是本预设**核对到哪一代宿主**的记录（1.0.9 核对到 `0.2.1-rc.2`），开区间只是不让没核对的宿主把插件整个挡掉；它换的是装载兼容性，不是出厂行集合——出厂下次再加行，仍然要改 `cordis.patch.yml`。

`0.2.1` 里真的动了、本包已跟上的三处：宿主不再注册 `{{cwd}}` 提示词变量（`0.2.1-alpha.2` 起，人格正文改用 `{{model}}`）；`tool-subagent` 删掉了 `backgroundMode` 与 `enableRunInBackground`——子代理的后台执行改成无条件，留着这两个键不报错但纯属死配置，已从行里移除；出厂 `standard` 自己也走了——加了 `time-context`、`tool-schedule` 和一条默认禁用的 `plugin-market/tools`，把 `tool-ralph` 连同 codex / claude-code 两条 provider 行一起删掉，plan-mode 的提示词也改了措辞。`preset-yuike` 现在对齐的是这一代，ralph 也对齐（出厂不带这条工具，本包同样把它关掉，只是把行留在原处当开关）。

新增那几行为什么要探包而不是直接写：预设里一条启用的行如果包名解析不到，代价不是跳过一行。Loader 只会把导入失败记进日志、让这个 entry 始终没有 fiber（`vendor/loader` 的 `entry.ts`），`agent-preset-registry` 的装配审计把"没有 fiber"读成 `never started` 并抛错（`mount.ts`），抛的是**整份预设**的挂载——建会话时直接报 `agent-preset/invalid`。所以 `time-context` 与 `tool-schedule` 用 `createRequire(ctx.baseUrl)` 解析自己的包（`ctx.baseUrl` 正是 Loader 导入这些名字用的基准，出厂 `cordis` 预设也是同一个手法），探不到就把整行禁用。

## 工具链取舍

| 状态 | 行 |
|---|---|
| 保留 | tool-bash / tool-pwsh（按平台自动取舍）、tool-fs、tool-fs-search、tool-jobs、tool-schedule（探包）、time-context（探包）、command-goal、tool-goal、plan mode + compaction（含 tool-result-pruner）、subagent / subagent_fork、list-agents、tool-workflow、tool-ask-user、tool-todo、tool-web（fetch 开、搜索超时 60s）、present |
| 禁用 | **tool-ralph**（本预设主动关的：猫娘不做无人值守的反复重试；0.2.1 出厂 standard 已不再声明这一行）、skill-filesystem、tool-skill、tool-plugin-manager、tool-plugin-market（后四条同出厂 standard）；codex / claude-code provider（宿主默认未装对应 Bundle） |

想启用某条禁用行：0.1.6 在铺设出的副本上删掉对应的 `disabled: true` 即可；0.1.7+ 的预设没有逐行开关——它整份来自 `preset-yuike` 声明行的 `config.plugins`，改法是在包内定义里去掉目标行的 `disabled` 后重装。但上面标了"探包"的那两行要留神：它们的 `disabled` 是能力探测而不是偏好，宿主真带了那个包才谈得上打开，探不到还硬启用就是把整份预设一起拖下去。开 `tool-ralph` 同理——先确认宿主带着 `@deepseek-ai/dsh-tool-ralph`（0.2.1 起它归可选 Bundle `dsh-experimental-ralph-bundle`）。

## 文件与开发

```
cordis.patch.yml             预设定义本体（0.1.7+ 声明行）+ 门控的旧版插件行
lib/                         node/浏览器半区：仅 0.1.6 挂载，负责目录铺设
template/                    0.1.6 铺设副本，与 patch 定义同源——修改须同步两份
```

源码仓库直接调试：`dsh web --patch ./cordis.patch.yml`。

预设内部行 id 一律带 `yuike-` 前缀：插件市场按 patch 文件的行扫描判定「本插件归属的条目 id」，与同级插件（如 dsh-novel-solo）共用无前缀的 `persona` / `tool-bash` 等 id 会被判为重复条目而拒绝同时安装。

人格正文里的 `{{变量}}` 插值是严格的，只能写宿主已注册的提示词变量——目前是 `{{model}}` 与 `{{provider}}`；`{{cwd}}` 从宿主 `0.2.1-alpha.2` 起不再注册，写它会让每次装配系统提示词直接抛错。

## 环境变量（仅 0.1.6 铺设路径）

| 变量 | 作用 | 默认 |
|---|---|---|
| `DSH_HOME` | dsh 根目录 | `~/.dsh` |
| `DSH_YUIKE_SKIP_DEPLOY` | `1` 时跳过预设铺设 | 无 |
| `DSH_YUIKE_REDEPLOY` | `1` 时强制覆盖已存在的预设（慎用） | 无 |

## 许可证

MIT License

Copyright (c) 2026 Tkingxiao

特此免费授予任何获得本软件及相关文档文件（以下简称「软件」）副本的人，无限制地处理本软件，包括但不限于使用、复制、修改、合并、发布、分发、再许可和/或销售本软件的副本，并允许向其提供本软件的人这样做，前提是满足以下条件：

上述版权声明和本许可声明应包含在本软件的所有副本或实质性部分中。

本软件按「原样」提供，不提供任何明示或隐含的担保，包括但不限于适销性、特定用途适用性和非侵权性的担保。在任何情况下，作者或版权持有人均不对因本软件或本软件的使用或其他交易而产生、或与之相关的任何索赔、损害或其他责任负责，无论是基于合同、侵权或其他方式。
