import { useMemo, useState } from 'react'

import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { professores as servicoProfessores } from '../../../services/pessoas'
import { matriculas } from '../../../services/turmas'
import { agruparPorSimulado, mediaPorDisciplina, tendenciaPorDisciplina } from './agregacoesDesempenho'

export type { DesempenhoSimulado } from './agregacoesDesempenho'

export interface NotaDetalhada {
  tentativaId: number
  alunoId: number
  simuladoId: number
  simuladoTitulo: string
  /** 0 a 100. */
  percentual: number
}

/**
 * Dados e filtros das telas de detalhamento de desempenho: o mesmo cálculo do
 * painel (Desempenho.tsx), parametrizado pelos filtros.
 *
 * Filtrar por aluno muda o que "desempenho" significa: em vez da média da
 * turma em cada simulado, cada `DesempenhoSimulado` passa a refletir só a
 * nota daquele aluno — é o que permite às 3 telas mostrarem o desempenho
 * individual sem precisar de um caminho de cálculo separado.
 */
export function useDesempenhoDados() {
  const { professorId } = useProfessorLogado()

  // Estado do formulário, separado de filtrosAplicados (só muda em "Buscar").
  // turmaId é reativo porque alimenta as opções de disciplina e aluno.
  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)
  const [alunoId, setAlunoId] = useState<number | null>(null)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    turmaId: null as number | null,
    disciplinaId: null as number | null,
    alunoId: null as number | null,
    dataInicio: '',
    dataFim: '',
  })

  const requisicaoTentativas = useRequisicao(
    () => servicoProfessores.desempenho(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )
  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )
  const requisicaoMatriculas = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )

  const opcoesTurmas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (vinculo.turma && vinculo.status !== 'INATIVO') unicas.set(vinculo.turma.id, vinculo.turma.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data])

  const opcoesDisciplinas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (!vinculo.disciplina || vinculo.status === 'INATIVO') continue
      if (turmaId && vinculo.turma?.id !== turmaId) continue
      unicas.set(vinculo.disciplina.id, vinculo.disciplina.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data, turmaId])

  // Matrícula é por turma: sem turma não há alunos a oferecer.
  const opcoesAlunos = useMemo(() => {
    if (!turmaId) return []
    return (requisicaoMatriculas.data ?? []).map((matricula) => ({
      value: matricula.aluno.id,
      label: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
    }))
  }, [requisicaoMatriculas.data, turmaId])

  // Base única já filtrada para todas as agregações abaixo.
  const tentativasFiltradas = useMemo(() => {
    const { turmaId: turmaAplicada, disciplinaId: disciplinaAplicada, alunoId: alunoAplicado, dataInicio: deAplicado, dataFim: ateAplicado } =
      filtrosAplicados

    return (requisicaoTentativas.data ?? []).filter((tentativa) => {
      if (turmaAplicada && tentativa.turmaId !== turmaAplicada) return false
      if (disciplinaAplicada && tentativa.disciplinaId !== disciplinaAplicada) return false
      if (alunoAplicado && tentativa.alunoId !== alunoAplicado) return false

      const data = tentativa.data?.slice(0, 10)
      if (deAplicado && (!data || data < deAplicado)) return false
      if (ateAplicado && (!data || data > ateAplicado)) return false

      return true
    })
  }, [requisicaoTentativas.data, filtrosAplicados])

  // Guarda aluno/simulado para detalhar a faixa clicada no histograma.
  const notasDetalhadas = useMemo<NotaDetalhada[]>(
    () =>
      tentativasFiltradas.map((tentativa) => ({
        tentativaId: tentativa.id,
        alunoId: tentativa.alunoId,
        simuladoId: tentativa.simuladoId,
        simuladoTitulo: tentativa.simuladoTitulo,
        percentual: tentativa.percentual,
      })),
    [tentativasFiltradas],
  )

  const notasPercentuais = useMemo(() => notasDetalhadas.map((item) => item.percentual), [notasDetalhadas])

  const desempenhos = useMemo(
    () => agruparPorSimulado(tentativasFiltradas).sort((a, b) => a.percentual - b.percentual),
    [tentativasFiltradas],
  )
  const desempenhoPorDisciplina = useMemo(() => mediaPorDisciplina(desempenhos), [desempenhos])
  const tendencia = useMemo(() => tendenciaPorDisciplina(desempenhos), [desempenhos])

  const loading = requisicaoTentativas.loading || requisicaoVinculos.loading
  const error = requisicaoTentativas.error ?? requisicaoVinculos.error

  /** Copia o formulário para os filtros aplicados: só aqui os gráficos refiltram. */
  function buscar() {
    setFiltrosAplicados({ turmaId, disciplinaId, alunoId, dataInicio, dataFim })
  }

  /** "Limpar" é diferente de "Buscar vazio": reseta o formulário E já aplica na hora, sem precisar clicar em Buscar de novo. */
  function limparFiltros() {
    setTurmaId(null)
    setDisciplinaId(null)
    setAlunoId(null)
    setDataInicio('')
    setDataFim('')
    setFiltrosAplicados({ turmaId: null, disciplinaId: null, alunoId: null, dataInicio: '', dataFim: '' })
  }

  return {
    turmaId,
    setTurmaId: (valor: number | null) => {
      setTurmaId(valor)
      setDisciplinaId(null)
      setAlunoId(null)
    },
    disciplinaId,
    setDisciplinaId,
    alunoId,
    setAlunoId,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    filtrosAplicados,
    buscar,
    limparFiltros,
    opcoesTurmas,
    opcoesDisciplinas,
    opcoesAlunos,
    carregandoAlunos: turmaId ? requisicaoMatriculas.loading : false,
    carregandoVinculos: requisicaoVinculos.loading,
    desempenhos,
    notasPercentuais,
    notasDetalhadas,
    desempenhoPorDisciplina,
    tendenciaPorDisciplina: tendencia,
    tentativas: tentativasFiltradas,
    loading,
    error,
    reload: requisicaoTentativas.reload,
  }
}
