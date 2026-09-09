import type { SelectOption } from '../../../components/ui/Select'
import { formatarData } from '../../../utils/format'

interface RecorteDesempenho {
  opcoesTurmas: SelectOption<number>[]
  opcoesDisciplinas: SelectOption<number>[]
  opcoesAlunos: SelectOption<number>[]
  turmaId: number | null
  disciplinaId: number | null
  alunoId: number | null
  dataInicio: string
  dataFim: string
}

/**
 * Monta as 4 linhas de texto do recorte aplicado (turma/disciplina/aluno/
 * período) — em arquivo próprio (não dentro de ResumoFiltrosDesempenho.tsx)
 * porque um arquivo de componente só pode exportar componentes (Fast
 * Refresh). Reaproveitado tanto na tela (ResumoFiltrosDesempenho, com
 * ícone) quanto no PDF exportado (GraficoCard.contextoTexto), que só aceita
 * texto puro.
 */
export function resumoFiltrosTexto({
  opcoesTurmas,
  opcoesDisciplinas,
  opcoesAlunos,
  turmaId,
  disciplinaId,
  alunoId,
  dataInicio,
  dataFim,
}: RecorteDesempenho): string[] {
  const nomeTurma = turmaId ? opcoesTurmas.find((opcao) => opcao.value === turmaId)?.label : null
  const nomeDisciplina = disciplinaId
    ? opcoesDisciplinas.find((opcao) => opcao.value === disciplinaId)?.label
    : null
  const nomeAluno = alunoId ? opcoesAlunos.find((opcao) => opcao.value === alunoId)?.label : null

  const periodo =
    dataInicio || dataFim
      ? `De ${dataInicio ? formatarData(dataInicio) : 'sempre'} até ${dataFim ? formatarData(dataFim) : 'hoje'}`
      : 'Todo o histórico'

  return [
    `Turma: ${nomeTurma ?? 'Todas as turmas que você leciona'}`,
    `Disciplina: ${nomeDisciplina ?? 'Todas as disciplinas'}`,
    `Aluno: ${nomeAluno ?? 'Todos os alunos'}`,
    `Período: ${periodo}`,
  ]
}

export type { RecorteDesempenho }
