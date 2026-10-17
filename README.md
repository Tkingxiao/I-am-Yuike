# i-am-yuike

A DeepSeek Harness plugin that **ships the 猫娘 Yuike persona preset**. Published on npm as [`i-am-yuike`](https://www.npmjs.com/package/i-am-yuike).

Once installed, pick `yuike` in a new preset session — the catgirl persona takes effect immediately as the sole system prompt: no harness framing, no skill-catalog noise.

## Install

```sh
dsh plugin --profile web add i-am-yuike   # or github:Tkingxiao/I-am-Yuike
dsh web
```

The rows are selected by host version: on **dsh >= 0.1.7** the `preset-yuike` composition row registers the preset directly (nothing is written into `<dshHome>`); on **dsh 0.1.6** the plugin **idempotently deploys** the preset from `template/` to `<dshHome>/.agent-presets/yuike/` (skips if the target already exists — it never overwrites your edited preset). Then open a new preset session and pick `yuike` — the catgirl persona takes effect immediately.

> On a plugin upgrade: on 0.1.7 re-run `dsh plugin --profile web add i-am-yuike@latest` to refresh the declaration row — but a same-id override row in your profile's user patch will keep shadowing the packaged definition (new persona text will not flow in), so delete it to catch up; on 0.1.6 delete `<dshHome>/.agent-presets/yuike` (or set `DSH_YUIKE_REDEPLOY=1`) to pick up the latest changes, since idempotent deploy never overwrites an existing copy on its own.

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
- **Main toolchain kept**: shell (bash/pwsh), filesystem read/write/search, background jobs, goals, plan & compaction, subagents/workflows/ralph, ask-user, todo, web fetch/search, and present all stay available (`tool-ralph` stays enabled even though 0.1.7's stock standard preset disables it); only the optional subagent providers (`codex` / `claude-code`) are disabled by default, as the host dictates. See the table below.
- **Self-contained personality**: the persona (猫娘 Yuike) drives identity, language style, action brackets, emoji/kaomoji, and the `{好感度}` suffix — all inside the preset definition, no external file needed.
- **Two definitions, one source**: the 0.1.7+ shape is the `preset-yuike` row in `cordis.patch.yml`; the 0.1.6 fallback ships the same content as `template/agent.cordis.yml` (persona + toolchain wiring) and `template/preset.yml` (name/description metadata). Edit both in sync.

## Host-version adaptation

| Host | Mechanism | On plugin upgrade |
|---|---|---|
| **>= 0.1.7** | An `@deepseek-ai/dsh-agent-preset` declaration row in `cordis.patch.yml`; nothing is written into `<dshHome>` | `dsh plugin --profile web add i-am-yuike@latest` refreshes the row; a same-id row in your profile's user patch keeps overriding this declaration row — drop it to pick up new changes |
| **0.1.6** | The node half idempotently deploys `template/` to `<dshHome>/.agent-presets/yuike/` (never overwrites) | Delete that directory or set `DSH_YUIKE_REDEPLOY=1` |

Both rows live in the same patch and are gated by one shared host-version probe expression (reading the host's own `package.json` version through the loader's `profileContext.installAnchor`) — exactly one activates per host, and the `>= 0.1.7` branch covers 0.2.0 and everything above it. After upgrading the host to 0.1.7, a leftover `.agent-presets/yuike` directory from the old path is simply ignored and can be deleted.

Whether the plugin loads at all is settled earlier, before any of its code runs: since host `0.1.7-rc.1` the profile composition evaluates every `@deepseek-ai/dsh*` range in `peerDependencies` against the running release and disables the row when one of them doesn't match, and since `0.2.1-alpha.4` it looks at `engines.dsh` first — once that field is present it decides the verdict alone and `peerDependencies` stops participating (both rules were tested against the host code of `0.2.1-alpha.3` and `0.2.1-rc.2`). So both lists are kept: they name `0.1.6-alpha.1` through `0.2.1-rc.2` and then end in the open arm `>=0.1.7-alpha.1` with no upper bound, because nothing here is bound to a particular host build: the route is picked by the plugin's own probe at load time, so an unchecked release should still get a working preset rather than lose the plugin to a check that fails closed. The versions named before the open arm are the ones actually compared — `0.2.0-rc.1`, `0.2.1-alpha.3` and `0.2.1-rc.2` were run with both plugins installed side by side (the web server boots, `--dump-config` shows both declaration rows and both roster ids, nothing gets force-disabled), while `0.1.7-rc.2`, `0.2.0-rc.2` and `0.2.1-alpha.1` were checked by reading the host source at those releases, where the preset row fields and the `standard` factory preset this one is built on are unchanged from `0.1.7-rc.1` except for three rows the factory added since (`time-context`, `tool-schedule`, `plugin-market/tools`), which this frozen copy simply doesn't carry; nothing it references was renamed or removed. An open arm promises it loads, not that a future contract change can't break the preset definition — if one does, the fix belongs in `cordis.patch.yml`, not in the range. Installing on a host that refused the plugin before takes a `dsh web` restart, since the decision happens while the profile is composed. The `engines.dsh` list doubles as the record of how far this preset was actually reconciled against factory `standard`; the open arm only stops an unverified host from refusing the plugin, it does not inherit new factory rows — carrying `tool-schedule` and friends would be a `cordis.patch.yml` change.

Two `0.2.1` contract changes this package has caught up with: the host no longer registers a `{{cwd}}` prompt variable (as of `0.2.1-alpha.2`, so the persona prose uses `{{model}}`), and `tool-subagent` dropped `backgroundMode` and `enableRunInBackground` — subagent background execution is unconditional now, so those keys were removed from the rows (they no longer raise an error, they just do nothing).

## Toolchain trims

| State | Rows |
|---|---|
| Kept | tool-bash / tool-pwsh (auto-selected by platform), tool-fs, tool-fs-search, tool-jobs, command-goal, tool-goal, plan mode + compaction (with tool-result-pruner), subagent / subagent_fork, list-agents, tool-workflow, **tool-ralph**, tool-ask-user, tool-todo, tool-web (fetch on, 60s search timeout), present |
| Disabled | skill-filesystem, tool-skill, tool-plugin-manager (as in the stock standard preset); codex / claude-code providers (a stock host does not install those bundles) |

To enable a disabled row: on 0.1.6 delete the `disabled: true` line in the deployed copy; on 0.1.7+ there is no per-row switch — the preset comes wholly from the `preset-yuike` row's `config.plugins`, so remove the `disabled` flag in the packaged definition and reinstall.

## Files & development

```
cordis.patch.yml             the preset definition itself (0.1.7+ declaration row) + the gated legacy plugin row
lib/                         node/browser halves: mounted on 0.1.6 only, deploys the preset directory
template/                    0.1.6 deploy copy — same source as the patch definition; keep both in sync when editing
```

Develop straight from this repo: `dsh web --patch ./cordis.patch.yml`.

Every row id inside the preset carries a `yuike-` prefix: the plugin market scans the patch file line-by-line to decide which entry ids a package owns, and un-prefixed ids such as `persona` / `tool-bash` shared with a sibling plugin (e.g. dsh-novel-solo) are reported as duplicate entries that refuse to install side by side.

`{{variable}}` interpolation in the persona text is strict — only variables the host actually registers may be referenced. Today those are `{{model}}` and `{{provider}}`; `{{cwd}}` stopped being registered in host `0.2.1-alpha.2`, so referencing it makes every system-prompt assembly throw.

## Environment variables (0.1.6 deploy path only)

| Variable | Purpose | Default |
|---|---|---|
| `DSH_HOME` | dsh home directory | `~/.dsh` |
| `DSH_YUIKE_SKIP_DEPLOY` | `1` skips preset deployment | none |
| `DSH_YUIKE_REDEPLOY` | `1` forcibly overwrites an existing preset (use with care) | none |

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
