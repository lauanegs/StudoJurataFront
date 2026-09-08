import { BookOpen, CalendarClock, User, Users } from 'lucide-react'

import { ListaInfo } from '../../../components/ui/ListaInfo'
import type { SelectOption } from '../../../components/ui/Select'
import { formatarData } from '../../../utils/format'

interface ResumoFiltrosDesempenhoProps {
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
 * Campo inicial (mesmo padrão do DetalheSimuladoModal: ícone + texto, um por
 * linha) descrevendo o recorte atual dos gráficos abaixo — confirmado pelo
 * usuário, pras 3 telas de detalhamento de desempenho (Visão geral,
 * Evolução, Por simulado), que já filtram por turma/disciplina/aluno/período
 * mas não deixavam explícito, perto do gráfico, a que exatamente aquele
 * recorte se referia.
 */
export function ResumoFiltrosDesempenho({
  opcoesTurmas,
  opcoesDisciplinas,
  opcoesAlunos,
  turmaId,
  disciplinaId,
  alunoId,
  dataInicio,
  dataFim,
}: ResumoFiltrosDesempenhoProps) {
  const nomeTurma = turmaId ? opcoesTurmas.find((opcao) => opcao.value === turmaId)?.label : null
  const nomeDisciplina = disciplinaId
    ? opcoesDisciplinas.find((opcao) => opcao.value === disciplinaId)?.label
    : null
  const nomeAluno = alunoId ? opcoesAlunos.find((opcao) => opcao.value === alunoId)?.label : null

  const periodo =
    dataInicio || dataFim
      ? `De ${dataInicio ? formatarData(dataInicio) : 'sempre'} até ${dataFim ? formatarData(dataFim) : 'hoje'}`
      : 'Todo o histórico'

  return (
    <ListaInfo
      itens={[
        { icon: <Users />, texto: `Turma: ${nomeTurma ?? 'Todas as turmas que você leciona'}` },
        { icon: <BookOpen />, texto: `Disciplina: ${nomeDisciplina ?? 'Todas as disciplinas'}` },
        { icon: <User />, texto: `Aluno: ${nomeAluno ?? 'Todos os alunos'}` },
        { icon: <CalendarClock />, texto: `Período: ${periodo}` },
      ]}
    />
  )
}
