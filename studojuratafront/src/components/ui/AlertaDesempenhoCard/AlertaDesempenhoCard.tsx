import * as S from './styles'
import type { AlertaDesempenhoCardProps } from './types'

export function AlertaDesempenhoCard({
  titulo,
  descricao,
  media
}: AlertaDesempenhoCardProps) {
  return (
    <S.Container>
      <S.Icon src="/images/alert.png" alt="Alerta de desempenho" />

      <S.Content>
        <S.Title>{titulo}</S.Title>
        <S.Description>{descricao}</S.Description>
        <S.Media>Média geral {media}</S.Media>
      </S.Content>
    </S.Container>
  )
}