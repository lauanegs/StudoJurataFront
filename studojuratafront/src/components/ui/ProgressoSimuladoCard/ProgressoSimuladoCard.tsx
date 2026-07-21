import * as S from './styles'
import type { ProgressoSimuladoCardProps, StatusQuestaoProgresso } from './types'

const CORES: Record<StatusQuestaoProgresso, string> = {
  correta: '#1db954',
  incorreta: '#e0525c',
  atual: '#049DBF',
  pendente: '#e5e7eb',
}

export function ProgressoSimuladoCard({ total, atual, status }: ProgressoSimuladoCardProps) {
  return (
    <S.Container>
      <S.Titulo>Questão {atual} de {total}</S.Titulo>

      <S.Trilha>
        {status.map((s, index) => (
          <S.Bolinha key={index} $cor={CORES[s]} />
        ))}
      </S.Trilha>

      <S.Legenda>
        <S.LegendaItem><S.LegendaBolinha $cor={CORES.correta} /> Respondida certa</S.LegendaItem>
        <S.LegendaItem><S.LegendaBolinha $cor={CORES.incorreta} /> Respondida errada</S.LegendaItem>
        <S.LegendaItem><S.LegendaBolinha $cor={CORES.atual} /> Atual</S.LegendaItem>
        <S.LegendaItem><S.LegendaBolinha $cor={CORES.pendente} /> Não respondida</S.LegendaItem>
      </S.Legenda>
    </S.Container>
  )
}
