# i-am-yuike

A DeepSeek Harness plugin that **ships the 猫娘 Yuike persona preset**. Published on npm as [`i-am-yuike`](https://www.npmjs.com/package/i-am-yuike).

Once installed, pick `yuike` in a new preset session — the catgirl persona takes effect immediately as the sole system prompt: no harness framing, no skill-catalog noise.

## Install

```sh
dsh plugin --profile web add i-am-yuike   # or github:Tkingxiao/I-am-Yuike
dsh web
```

The plugin inserts one `preset-yuike` composition declaration row into the profile, which registers the preset directly (nothing is written into `<dshHome>`). Then open a new preset session and pick `yuike` — the catgirl persona takes effect immediately. **This plugin requires dsh >= 0.2.1**; older hosts are no longer supported.

> On a plugin upgrade: re-run `dsh plugin --profile web add i-am-yuike@latest` to refresh the declaration row — but a same-id override row in your profile's user patch will keep shadowing the packaged definition (new persona text will not flow in), so delete it to catch up.

## Usage: thinking mode and persona stability

The persona is anchored by in-session conversation history. If thinking mode is enabled from the very first message, the reasoning pass has no in-character history to condition on and tends to fall back to base assistant behavior — the response explodes on the spot (identity framing, refusals, broken character).

The fix is a two-step warm-up:

1. **First conversation: thinking OFF.** Start the session with thinking mode disabled and run your first persona conversation (including 破限向 content) with it off. This writes fully in-character assistant turns into the session history.
2. **Every conversation after: thinking ON.** Re-enable thinking mode from the next exchange onward. The reasoning pass is now conditioned on the in-character history, so the persona holds and thinking works normally.

Skipping step 1 and opening with thinking on means the persona usually explodes immediately on 破限向 content. Within one session, the warm-up only needs to happen once.

## Persona highlights

The prompt-side and tool-side trims match the sibling project [dsh-novel-solo](https://github.com/Tkingxiao/dsh-novel-solo).

- **Persona owns the system prompt**: `complete: true` makes the assembled Yuike persona the *only* system-prompt section; `includeRuntimeContext: false` drops the per-round runtime-context snapshots (Current runtime context / DSH file policy / Approval prompts, etc.). The harness identity opener, `@`-path/exit-code rules, and background-job guidance are no longer injected — the catgirl persona leads the prompt cleanly. Tool schemas still inject normally.
- **Zero skill-catalog noise**: disables the `skill-filesystem` / `tool-skill` toolchain. `tool-skill` always injects a `{kind:"skill-catalog",…}` skill catalog message into the session, and there is no way to hide just the catalog while keeping the tool — so the toolchain is disabled instead.
- **Main toolchain kept**: shell (bash/pwsh), filesystem read/write/search, background jobs, schedule reminders (`schedule_create/list/update/delete`), time context, goals, plan & compaction, subagents/workflows, ask-user, todo, web fetch/search, and present all stay available — the same model-visible tool set the 0.2.1 stock `standard` preset exposes. Rows naming a package the running host does not ship are probed and dropped rather than declared blind (`tool-schedule`, `time-context`). `tool-ralph` is disabled here: this persona does not do unattended retry loops; the row is kept switched off as an explicit switch. Only the optional subagent providers (`codex` / `claude-code`) are disabled by default, as the host dictates. See the table below.
- **Self-contained personality**: the persona (猫娘 Yuike) drives identity, language style, action brackets, emoji/kaomoji, and the `{好感度}` suffix — all inside the preset definition, no external file needed.

## Host-version adaptation

Requires **dsh >= 0.2.1**. The preset registers through one `@deepseek-ai/dsh-agent-preset` declaration row in `cordis.patch.yml` — nothing is written into `<dshHome>`; the `time-context` / `tool-schedule` / `list-agents` rows are package-availability probes and disable themselves when the package is missing. Loadability is decided by `engines.dsh` alone (the open `>=0.2.1-alpha.1` arm only promises the plugin loads).

The two `0.2.2-alpha.2` contract changes (`list_agents` folded into the main entry, `modelSelectionSettings` renamed `modelSelection`) are absorbed by a subpath probe and a dual-key write — no configuration needed.

## Toolchain trims

| State | Rows |
|---|---|
| Kept | tool-bash / tool-pwsh (auto-selected by platform), tool-fs, tool-fs-search, tool-jobs, tool-schedule (probed), time-context (probed), command-goal, tool-goal, plan mode + compaction (with tool-result-pruner), subagent / subagent_fork, list-agents (probed: the `…/list-agents` subpath only exists before 0.2.2, where the main entry does not register the tool), tool-workflow, tool-ask-user, tool-todo, tool-web (fetch on, 60s search timeout), present |
| Disabled | **tool-ralph** (a deliberate preference here — no unattended retry loop under this persona; `standard` dropped the row entirely in 0.2.1), skill-filesystem, tool-skill, tool-plugin-manager, tool-plugin-market (the last three as in the stock standard preset); codex / claude-code providers (a stock host does not install those bundles) |

To enable a disabled row: there is no per-row switch — the preset comes wholly from the `preset-yuike` row's `config.plugins`, so remove the `disabled` flag in the packaged definition and reinstall. For the two probed rows, `disabled` is a capability expression rather than a preference: clearing it only helps if the host actually ships that package, and on a host that doesn't the row will take the whole preset down with it.

## Files & development

```
cordis.patch.yml             the preset definition itself (an @deepseek-ai/dsh-agent-preset declaration row)
lib/                         node/browser halves: empty placeholders keeping the entry exports valid
```

Develop straight from this repo: `dsh web --patch ./cordis.patch.yml`.

Every row id inside the preset carries a `yuike-` prefix: the plugin market scans the patch file line-by-line to decide which entry ids a package owns, and un-prefixed ids such as `persona` / `tool-bash` shared with a sibling plugin (e.g. dsh-novel-solo) are reported as duplicate entries that refuse to install side by side.

`{{variable}}` interpolation in the persona text is strict — only variables the host actually registers may be referenced. Today those are `{{model}}` and `{{provider}}`; `{{cwd}}` stopped being registered in host `0.2.1-alpha.2`, so referencing it makes every system-prompt assembly throw.

## License

MIT License

Copyright (c) 2026 Tkingxiao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
