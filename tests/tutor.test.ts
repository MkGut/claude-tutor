import { expect, mock, test } from 'claude-code/testing'

const LESSON = {
  title: 'Pushing to GitHub',
  lesson: 'A **push** uploads your local commits to the remote copy.',
  question: 'What does a push send?',
  answer: 'Your local commits.',
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

test('turns the work it watched into a lesson card with a quiz', async ($, on) => {
  mock.clock(on)
  const asked: string[] = []
  on('model.complete', (_$, e) => {
    asked.push(e.prompt)

    return { value: { isAnswered: true, text: JSON.stringify(LESSON), usage: {} } } as never
  })
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  on('tool.call', () => ({ result: {}, text: 'Everything up-to-date' }) as never)

  await $.turn.start({ text: 'push my work to github', turnId: 't1' })
  await $.tool.call({ tool: 'Bash', command: 'git push origin main' } as never)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    await ui.press({ key: 'explain' })

    expect(asked.at(-1)).toContain('git push origin main')
    expect(asked.at(-1)).toContain('push my work to github')
    expect(await ui.find({ text: /Pushing to GitHub/ })).toBeDefined()
    expect(await ui.find({ type: 'Markdown', text: /Your local commits/ })).toBeUndefined()

    await ui.press({ key: 'reveal' })
    expect(await ui.find({ type: 'Markdown', text: /Your local commits/ })).toBeDefined()

    await ui.press({ key: 'clear' })
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
  await ui.input({ key: 'ask', text: 'what is a commit?' })

  expect(await ui.find({ text: /You asked: what is a commit\?/ })).toBeDefined()
  expect(await ui.find({ type: 'Markdown', text: /snapshot/ })).toBeDefined()
  await ui.unmount()
})
