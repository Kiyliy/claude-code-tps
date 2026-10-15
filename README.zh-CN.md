# ⚡ tps

[English](README.md) · **简体中文**

Claude Code 的一个 mod（function hooks 插件），在底部状态栏显示模型吐 token 的速度。桌面版 Code 标签页和终端都能用。

```
⚡  92.3 tps · TTFT 2.1s · total 22.0s · avg 88.0 tps
```

| 字段 | 含义 |
| --- | --- |
| `tps` | 本次模型请求的输出速度：`usage.output_tokens` ÷ 生成时间（第一个流式片段到结束，不含首字延迟） |
| `TTFT` | 首字延迟：请求发出到第一个流式片段 |
| `total` | 单次请求总耗时：请求发出到最后一个片段 |
| `avg` | 本会话所有请求的平均速度 |

- 流式输出过程中显示估算值，如 `~120 tps`（按字符数估：英文约 4 字符/token，中日韩约 1 字/token），结束后换成按 API usage 算的准确值。
- 子代理发起的请求末尾标 `(sub)`。

## 安装

1. 克隆到固定目录：

   ```bash
   git clone https://github.com/Kiyliy/claude-code-tps.git ~/.claude/mods/tps
   ```

2. 在 `~/.claude/settings.json` 里加上（已有 `env` 就合并进去；多个目录在 Windows 上用 `;` 分隔）：

   ```json
   "env": { "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/tps" }
   ```

3. 新开一个会话即可生效。

## 说明

- 插件名故意设成 `⚡`：引擎会把插件名作为状态行前缀，而且不能关掉。校验时会提示名字不是 kebab-case，这只影响从插件市场安装，本地加载正常。
- 插件名在会话第一次加载插件时确定。改名要新开会话才能看到；只改代码的话，已打开的会话会自动重载。
- 实现方式：hook `turn.step` 流式事件，给每个片段打时间戳，结束时读 `usage.output_tokens`，再用 `$.ui.status()` 写进状态栏。

## 校验和测试

```bash
claude plugin validate ~/.claude/mods/tps
claude plugin test ~/.claude/mods/tps
```

mod API 目前是 early access，需要较新的 Claude Code，在 2.1.293 上验证过。
