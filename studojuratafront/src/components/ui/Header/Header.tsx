import * as S from './styles'
import type { HeaderProps } from './types'

export function Header({ titulo, children }: HeaderProps) {
  return (
    <S.Container>
      <S.Title>{titulo}</S.Title>

      <S.Actions>
        {children}
      </S.Actions>
    </S.Container>
  )
}