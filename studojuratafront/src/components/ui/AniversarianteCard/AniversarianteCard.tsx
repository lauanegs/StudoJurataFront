import * as S from './styles'
import type { AniversarianteCardProps } from './types'

export function AniversarianteCard({ nome, data }: AniversarianteCardProps) {
  return (
    <S.Container>
      <S.AvatarWrapper>
        <S.Avatar
          src="/images/aniversariante.jpeg"
          alt={`Foto de ${nome}`}
        />
      </S.AvatarWrapper>

      <S.Nome>{nome}</S.Nome>
      <S.DataBadge>{data}</S.DataBadge>
    </S.Container>
  )
}