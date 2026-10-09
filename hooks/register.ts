import type { Register } from 'claude-code'

// Rough live estimate: ~4 chars/token for Latin text, ~1 char/token for CJK.
const estimateTokens = (s: string) => {
  let cjk = 0
  for (const ch of s) if (ch.charCodeAt(0) > 0x2e80) cjk += 1
  return cjk + (s.length - cjk) / 4
}

const fmt = (n: number) => (n >= 100 ? n.toFixed(0) : n.toFixed(1))

// The plugin is named ⚡: the engine leads the status line with that name.
export const register: Register = on => {
  // Session totals (reset on reload, which is fine for a speed meter).
  let totalTokens = 0
  let totalMs = 0

  on('turn.step', async function* ($, e, next) {
    const sentAt = performance.now()
    let firstAt = 0
    let lastDraw = 0
    let estimate = 0

    const stream = next(e)
    for await (const chunk of stream) {
      const now = performance.now()
      if (chunk.kind !== 'engine') {
        if (firstAt === 0) firstAt = now
        if (chunk.kind === 'text' || chunk.kind === 'thinking') estimate += estimateTokens(chunk.text)
        else if (chunk.kind === 'input') estimate += estimateTokens(chunk.json)

        if (chunk.kind === 'stop') {
          const out = chunk.usage?.output_tokens ?? 0
          const genMs = now - firstAt
          if (out > 0 && genMs > 50) {
            totalTokens += out
            totalMs += genMs
            const ttft = (firstAt - sentAt) / 1000
            $.ui.status(
              `${fmt(out / (genMs / 1000))} tps · TTFT ${ttft.toFixed(1)}s · total ${((now - sentAt) / 1000).toFixed(1)}s · avg ${fmt(totalTokens / (totalMs / 1000))} tps` +
                (e.agentId ? ' (sub)' : ''),
            )
          }
        } else if (now - lastDraw > 500 && now - firstAt > 300) {
          lastDraw = now
          $.ui.status(`~${fmt(estimate / ((now - firstAt) / 1000))} tps`)
        }
      }
      yield chunk
    }
  })
}
