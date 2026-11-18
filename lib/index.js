/**
 * i-am-yuike — node half (placeholder).
 *
 * The preset is declared declaratively as an `@deepseek-ai/dsh-agent-preset`
 * composition row in cordis.patch.yml, which requires dsh >= 0.2.1. Hosts below
 * 0.2.1 are no longer supported: the legacy `.agent-presets/` directory
 * deployment (the `template/` copy and its version-gated node row) has been
 * removed, so there is nothing for this half to do. The row itself is gone from
 * cordis.patch.yml; this stub only keeps the `.` export valid for anyone whose
 * user patch layer still references the plugin.
 */

export const name = 'i-am-yuike'

export async function apply() {}
