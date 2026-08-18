import * as S from './styles'
import type { LetterBadgeProps } from './types'

export function LetterBadge({ letra, state = 'default' }: LetterBadgeProps) {
  return (
    <S.Container $state={state} aria-hidden="true">
      {letra}
    </S.Container>
  )
}
