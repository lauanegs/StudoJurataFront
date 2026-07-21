import { Clock, LogOut } from 'lucide-react'
import * as S from './styles'
import type { SimuladoHeaderProps } from './types'

export function SimuladoHeader({ titulo, tempo, onSair }: SimuladoHeaderProps) {
  return (
    <S.Container>
      <S.Left>
        <S.Logo src="/images/logo.png" alt="Studo Jurata" />
        <S.Titulo>{titulo}</S.Titulo>
      </S.Left>

      <S.Right>
        <S.Tempo><Clock size={16} /> {tempo}</S.Tempo>
        <S.SairButton onClick={onSair}><LogOut size={16} /> Sair</S.SairButton>
      </S.Right>
    </S.Container>
  )
}
