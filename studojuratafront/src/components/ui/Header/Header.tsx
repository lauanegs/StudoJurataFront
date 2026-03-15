import { Input } from '../Input/Input'
import * as S from './styles'
import type { HeaderProps } from './types'


export function Header({ titulo }: HeaderProps) {
  return (
    <S.Container>
      <S.Title>{titulo}</S.Title>

      <S.InputRow>
        <Input placeholder="Buscar turma..." />
      </S.InputRow>
    </S.Container>
  )
}