export type TutorCard = {
  id: string
  kind: 'lesson' | 'answer' | 'note'
  title: string
  body: string
  question?: string
  /** The quick check's options; absent, the answer is simply revealed. */
  choices?: string[]
  /** Which of `choices` is right, by index. */
  correct?: number
  answer?: string
}

export type TutorStatus = 'idle' | 'watching' | 'thinking'

declare module 'claude-code' {
  interface PluginState {
    tutor: {
      cards: TutorCard[]
      /** The option picked on each answered quick check, by card id. */
      picks: Record<string, number>
      status: TutorStatus
      isPaused: boolean
      asks: number
    }
  }
}
