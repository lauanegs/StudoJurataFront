export type LetterState = 'default' | 'selected' | 'correct' | 'incorrect'

export interface LetterBadgeProps {
  letra: string
  state?: LetterState
  size?: 'small' | 'medium' | 'large'
}
