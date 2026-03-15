import * as S from './styles'
import type { DesempenhoCardProps } from './types'

export function DesempenhoCard({
  titulo,
  descricao,
  porcentagem
}: DesempenhoCardProps) {

  function getColor() {
    if (porcentagem < 40) return 'danger'
    if (porcentagem < 70) return 'warning'
    return 'success'
  }

  return (
    <S.Container>
      <S.Content>
        <S.Title>{titulo}</S.Title>
        <S.Description>{descricao}</S.Description>
      </S.Content>

      <S.Percent color={getColor()}>
        {porcentagem}%
      </S.Percent>
    </S.Container>
  )
}