import { Button } from '../Button'
import * as S from './styles'
import type { SimuladoIniciarCardProps } from './types'

export function SimuladoIniciarCard({
  titulo,
  responsavel,
  quantidadeQuestoes,
  onIniciar,
}: SimuladoIniciarCardProps) {
  return (
    <S.Container>
      <S.Content>
        <S.Titulo>{titulo}</S.Titulo>
        <S.Descricao>{responsavel} | {quantidadeQuestoes} questões</S.Descricao>
      </S.Content>

      <Button label="Iniciar" onClick={onIniciar} />
    </S.Container>
  )
}
