export type TutorCard = {
  id: string
  kind: 'lesson' | 'answer' | 'note'
  title: string
  body: string
  question?: string
  answer?: string
}

export type TutorView = { index: number; isFollowing: boolean }

export type TutorStatus = 'idle' | 'watching' | 'thinking'

declare module 'claude-code' {
  interface PluginState {
    tutor: {
      cards: TutorCard[]
      view: TutorView
      revealed: string[]
      status: TutorStatus
      isPaused: boolean
    }
  }
}
