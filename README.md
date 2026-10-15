# ⚡ tps

**English** · [简体中文](README.zh-CN.md)

A tiny [Claude Code](https://docs.anthropic.com/en/docs/claude-code) mod that shows how fast the model is talking, right in the status line. Works in the terminal and in the desktop Code tab.

```
⚡  92.3 tps · TTFT 2.1s · total 22.0s · avg 88.0 tps
```

![license](https://img.shields.io/badge/license-MIT-blue)
![claude code](https://img.shields.io/badge/Claude_Code-mod-D97757)
![size](https://img.shields.io/badge/code-~50_lines-lightgrey)

| Field | Meaning |
| --- | --- |
| `tps` | Output speed of the last request: `usage.output_tokens` ÷ generation time (first streamed chunk → end, TTFT excluded) |
| `TTFT` | Time to first token: request sent → first streamed chunk |
| `total` | Wall time of the request: sent → last chunk |
| `avg` | Average speed over every request in this session |

- While a response is streaming you see a live estimate such as `~120 tps` (≈4 chars/token for Latin text, ≈1 char/token for CJK). When the response ends it switches to the exact value from the API usage.
- Requests made by sub-agents are tagged `(sub)`.

## Install

1. Clone it somewhere stable:

   ```bash
   git clone https://github.com/Kiyliy/claude-code-tps.git ~/.claude/mods/tps
   ```

2. Add it to `~/.claude/settings.json` (merge into an existing `env` block; separate several directories with `;` on Windows):

   ```json
   "env": { "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/tps" }
   ```

3. Start a new session.

## How it works

The mod hooks the `turn.step` stream, timestamps every chunk, reads `usage.output_tokens` when the step stops, and writes the result with `$.ui.status()`. The whole thing is [`hooks/register.ts`](hooks/register.ts).

Notes:

- The plugin is deliberately named `⚡`, because the engine always prefixes the status line with the plugin name. `claude plugin validate` warns that the name isn't kebab-case; that only matters for marketplace installs, local loading is fine.
- The name is read when a session first loads the plugin, so a rename needs a new session. Code changes hot-reload in open sessions.

## Validate & test

```bash
claude plugin validate ~/.claude/mods/tps
claude plugin test ~/.claude/mods/tps
```

The mod API is early access and needs a recent Claude Code; tested on 2.1.293.

## License

[MIT](LICENSE)
