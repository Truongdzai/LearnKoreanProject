export interface LearningPath {
  id: string
  language: string
  languageFlag: string
  goals: string[]
  interests: string[]
  level: string
  createdAt: number
  steps: PathStep[]
  progress: number
  learnGoal?: string
}

export interface PathStep {
  title: string
  detail: string
  duration?: string
  cefr?: string
}
