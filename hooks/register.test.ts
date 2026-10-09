import { expect, test } from 'claude-code/testing'

const spin = (ms: number) => {
  const end = performance.now() + ms
  while (performance.now() < end) {}
}

test('shows tokens/sec once the response stops', async ($, on) => {
  const statuses: (string | undefined)[] = []
  on('ui.status', ($, e) => {
    statuses.push(e.text)
    return { value: undefined }
  })
  on('turn.step', async function* ($, e) {
    yield { kind: 'text', index: 0, text: 'hello ' }
    spin(200)
    yield { kind: 'text', index: 0, text: 'world' }
    const usage = { input_tokens: 10, output_tokens: 40, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, model: 'm' }
    yield { kind: 'stop', stopReason: 'end_turn', usage }
    return { turnId: e.turnId, index: e.index, answer: 'hello world', toolUses: [], stopReason: 'end_turn', usage }
  })

  const stream = $.turn.step({ turnId: 't', index: 0, model: 'm', messageCount: 1 })
  let n = await stream.next()
  while (!n.done) n = await stream.next()

  expect(n.value.answer).toBe('hello world')
  const last = statuses[statuses.length - 1] ?? ''
  expect(last).toMatch(/total 0\.2s/)
  const rate = Number(/^([\d.]+) tps/.exec(last)?.[1])
  expect(rate > 150 && rate < 210).toBe(true)
})
