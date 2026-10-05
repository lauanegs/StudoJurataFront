import type { LetterState } from '@/components/simulados/LetterBadge/types'

export interface AlternativaButtonProps {
  letra: string
  texto: string
  state?: LetterState
  onSelect?: () => void
  disabled?: boolean
}
