import * as S from './styles'
import type { LetterBadgeProps } from './types'

export function LetterBadge({ letra, state = 'default', size = 'medium' }: LetterBadgeProps) {
  return (
    <S.Container $state={state} $size={size} aria-hidden="true">
      {letra}
    </S.Container>
  )
}
