import type { SelectOption } from '@/components/ui/Select'

export interface FiltrosDesempenhoProps {
  opcoesTurmas: SelectOption<number>[]
  opcoesDisciplinas: SelectOption<number>[]
  opcoesAlunos: SelectOption<number>[]
  turmaId: number | null
  disciplinaId: number | null
  alunoId: number | null
  dataInicio: string
  dataFim: string
  carregandoTurmas: boolean
  carregandoAlunos: boolean
  onTurmaChange: (valor: number | null) => void
  onDisciplinaChange: (valor: number | null) => void
  onAlunoChange: (valor: number | null) => void
  onDataInicioChange: (valor: string) => void
  onDataFimChange: (valor: string) => void
  onBuscar: () => void
  onLimpar: () => void
}
