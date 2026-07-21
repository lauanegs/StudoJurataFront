import * as S from './styles'
import type { GraficoDesempenhoAlunoProps } from './types'

const CORES = ['#f4c20d', '#e0525c', '#049DBF', '#1db954', '#8b5cf6']

export function GraficoDesempenhoAluno({ titulo, porcentagem }: GraficoDesempenhoAlunoProps) {
  const cor = CORES[Math.abs(titulo.length + porcentagem) % CORES.length]

  return (
    <S.Container>
      <S.RingWrapper $porcentagem={porcentagem} $cor={cor}>
        <S.RingInner $cor={cor}>{porcentagem}%</S.RingInner>
      </S.RingWrapper>

      <S.Titulo>{titulo}</S.Titulo>
    </S.Container>
  )
}
