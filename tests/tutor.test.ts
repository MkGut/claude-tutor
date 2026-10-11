import { expect, mock, test } from 'claude-code/testing'

const LESSON = {
  title: 'Pushing to GitHub',
  lesson: 'A **push** uploads your local commits to the remote copy.',
  question: 'What does a push send?',
  choices: ['Your whole disk', 'Your local commits', 'Nothing'],
  correct: 1,
  why: 'A push uploads the commits the remote lacks.',
}

const PANE = {
  plugin: 'tutor',
  component: 'Pane',
  requestId: 'tutor',
  props: {
    title: 'Tutor',
    isFocused: false,
    bodyColumns: 48,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40, contentRows: 0 },
    view: {},
  } as never,
} as const

test('writes cards as Claude works and waits on the quick check', async ($, on) => {
  const clock = mock.clock(on)
  const asked: string[] = []
  on('model.complete', (_$, e) => {
    asked.push(e.prompt)

    return { value: { isAnswered: true, text: JSON.stringify(LESSON), usage: {} } } as never
  })
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  on('tool.call', () => ({ result: {}, text: 'Everything up-to-date' }) as never)
  const work = (command: string) => $.tool.call({ tool: 'Bash', command } as never)

  await $.turn.start({ text: 'push my work to github', turnId: 't1' })
  await work('git push origin main')
  await clock.advance(10_000)

  expect(asked).toHaveLength(1)
  expect(asked[0]).toContain('git push origin main')
  expect(asked[0]).toContain('push my work to github')

  // More work, but two quick checks left open hold the tutor back.
  await work('git status')
  await clock.advance(70_000)
  await work('git log')
  await clock.advance(70_000)
  expect(asked).toHaveLength(2)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ text: /Pushing to GitHub/ })).toBeDefined()
    const option = await ui.find({ type: 'Button', text: /Your local commits/ })
    if (surface === 'terminal') {
      // A right answer is graded, and the next card follows a few seconds on.
      expect(await ui.find({ text: /Nice!/ })).toBeUndefined()
      await ui.press({ key: option?.key ?? '' })
      expect(await ui.find({ text: /Nice!/ })).toBeDefined()
      expect(await ui.find({ text: /1 of 1 right/ })).toBeDefined()
      await clock.advance(10_000)
      expect(asked).toHaveLength(3)
    }
    await ui.unmount()
  }
})

test('answers a question typed into the sidebar', async ($, on) => {
  mock.clock(on)
  on(
    'model.complete',
    () => ({ value: { isAnswered: true, text: 'A commit is a snapshot.', usage: {} } }) as never,
  )

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.input({ key: 'ask-0', text: 'what is a commit?' })

  expect(await ui.find({ text: /You asked: what is a commit\?/ })).toBeDefined()
  expect(await ui.find({ type: 'Markdown', text: /snapshot/ })).toBeDefined()
  // The box comes back empty for the next question.
  expect(await ui.find({ key: 'ask-1' })).toBeDefined()
  await ui.unmount()
})
