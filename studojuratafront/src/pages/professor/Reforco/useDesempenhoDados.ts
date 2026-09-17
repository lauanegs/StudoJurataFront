import { useMemo, useState } from 'react'

import type { ItemGraficoBarras } from '../../../components/graficos/GraficoBarras'
import type { PontoGraficoLinha } from '../../../components/graficos/GraficoLinha'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { disciplinas as servicoDisciplinas } from '../../../services/curriculo'
import { professores as servicoProfessores } from '../../../services/pessoas'
import { simuladoAlunos, simulados as servicoSimulados } from '../../../services/simulados'
import { matriculas, turmas as servicoTurmas } from '../../../services/turmas'
import { formatarData } from '../../../utils/format'
import type { TipoDestinacaoSimulado } from '../../../types/simulados'

export interface NotaDetalhada {
  tentativaId: number
  alunoId: number
  simuladoId: number
  simuladoTitulo: string
  /** 0 a 100. */
  percentual: number
}

export interface DesempenhoSimulado {
  simuladoId: number
  titulo: string
  turmaId: number
  turma: string
  disciplinaId: number
  disciplina: string
  percentual: number
  tentativas: number
  notaMaxima: number
  /** Pra ordenar a tendência ao longo do tempo — dataInicio do simulado, com createdAt como reserva. */
  data?: string
  tipoDestinacao?: TipoDestinacaoSimulado
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

  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoTentativas = useRequisicao(() => simuladoAlunos.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoTurmas = useRequisicao(() => servicoTurmas.listar(), [])
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

  const turmasDoProfessor = useMemo(
    () => new Set((requisicaoVinculos.data ?? []).map((vinculo) => vinculo.turma?.id)),
    [requisicaoVinculos.data],
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

    const simuladosFiltrados = (requisicaoSimulados.data ?? []).filter((simulado) => {
      if (!turmasDoProfessor.has(simulado.turmaId ?? undefined)) return false
      if (turmaAplicada && simulado.turmaId !== turmaAplicada) return false
      if (disciplinaAplicada && simulado.disciplinaId !== disciplinaAplicada) return false

      const data = (simulado.dataInicio ?? simulado.createdAt)?.slice(0, 10)
      if (deAplicado && (!data || data < deAplicado)) return false
      if (ateAplicado && (!data || data > ateAplicado)) return false

      return true
    })

    const mapaSimulados = new Map(simuladosFiltrados.map((simulado) => [simulado.id, simulado]))

    return (requisicaoTentativas.data ?? [])
      .filter(
        (tentativa) =>
          tentativa.status === 'CONCLUIDO' &&
          typeof tentativa.nota === 'number' &&
          mapaSimulados.has(tentativa.simuladoId) &&
          (!alunoAplicado || tentativa.alunoId === alunoAplicado),
      )
      .map((tentativa) => ({ tentativa, simulado: mapaSimulados.get(tentativa.simuladoId) }))
  }, [requisicaoSimulados.data, requisicaoTentativas.data, turmasDoProfessor, filtrosAplicados])

  // Guarda aluno/simulado para detalhar a faixa clicada no histograma.
  const notasDetalhadas = useMemo<NotaDetalhada[]>(
    () =>
      tentativasFiltradas.map(({ tentativa, simulado }) => ({
        tentativaId: tentativa.id,
        alunoId: tentativa.alunoId,
        simuladoId: tentativa.simuladoId,
        simuladoTitulo: simulado?.titulo ?? `Simulado ${tentativa.simuladoId}`,
        percentual: Math.min(100, ((tentativa.nota as number) / (simulado?.notaMaxima || 10)) * 100),
      })),
    [tentativasFiltradas],
  )

  const notasPercentuais = useMemo(() => notasDetalhadas.map((item) => item.percentual), [notasDetalhadas])

  const desempenhos = useMemo<DesempenhoSimulado[]>(() => {
    const acumulado = new Map<number, { soma: number; quantidade: number }>()
    tentativasFiltradas.forEach(({ tentativa }) => {
      const atual = acumulado.get(tentativa.simuladoId) ?? { soma: 0, quantidade: 0 }
      acumulado.set(tentativa.simuladoId, {
        soma: atual.soma + (tentativa.nota as number),
        quantidade: atual.quantidade + 1,
      })
    })

    return [...acumulado.entries()]
      .map(([simuladoId, valores]) => {
        const simulado = tentativasFiltradas.find((item) => item.tentativa.simuladoId === simuladoId)?.simulado
        const maxima = simulado?.notaMaxima || 10

        return {
          simuladoId,
          titulo: simulado?.titulo ?? `Simulado ${simuladoId}`,
          turmaId: simulado?.turmaId ?? 0,
          turma: (requisicaoTurmas.data ?? []).find((turma) => turma.id === simulado?.turmaId)?.titulo ?? 'Sem turma',
          disciplinaId: simulado?.disciplinaId ?? 0,
          disciplina:
            (requisicaoDisciplinas.data ?? []).find((disciplina) => disciplina.id === simulado?.disciplinaId)
              ?.titulo ?? 'Sem disciplina',
          percentual: Math.min(100, (valores.soma / valores.quantidade / maxima) * 100),
          tentativas: valores.quantidade,
          notaMaxima: maxima,
          data: simulado?.dataInicio ?? simulado?.createdAt ?? undefined,
          tipoDestinacao: simulado?.tipoDestinacao,
        }
      })
      .sort((a, b) => a.percentual - b.percentual)
  }, [tentativasFiltradas, requisicaoTurmas.data, requisicaoDisciplinas.data])

  // Desempenho médio por disciplina — média dos percentuais já calculados
  // por simulado (mesma lógica de Desempenho.tsx).
  const desempenhoPorDisciplina = useMemo<ItemGraficoBarras[]>(() => {
    const acumulado = new Map<string, { soma: number; quantidade: number }>()

    desempenhos.forEach((item) => {
      const atual = acumulado.get(item.disciplina) ?? { soma: 0, quantidade: 0 }
      acumulado.set(item.disciplina, { soma: atual.soma + item.percentual, quantidade: atual.quantidade + 1 })
    })

    return [...acumulado.entries()]
      .map(([disciplina, valores]) => ({ chave: disciplina, rotulo: disciplina, valor: valores.soma / valores.quantidade }))
      .sort((a, b) => a.valor - b.valor)
  }, [desempenhos])

  // Só disciplinas com 2+ simulados; com aluno filtrado, cada ponto é a nota dele.
  const tendenciaPorDisciplina = useMemo(() => {
    const porDisciplina = new Map<string, DesempenhoSimulado[]>()

    desempenhos
      .filter((item) => item.data)
      .forEach((item) => {
        const lista = porDisciplina.get(item.disciplina) ?? []
        lista.push(item)
        porDisciplina.set(item.disciplina, lista)
      })

    return [...porDisciplina.entries()]
      .map(([disciplina, itens]) => ({
        disciplina,
        pontos: [...itens]
          .sort((a, b) => new Date(a.data as string).getTime() - new Date(b.data as string).getTime())
          .map<PontoGraficoLinha>((item) => ({
            chave: String(item.simuladoId),
            rotulo: formatarData(item.data),
            valor: item.percentual,
          })),
      }))
      .filter((item) => item.pontos.length >= 2)
  }, [desempenhos])

  const loading =
    requisicaoSimulados.loading ||
    requisicaoTentativas.loading ||
    requisicaoDisciplinas.loading ||
    requisicaoTurmas.loading ||
    requisicaoVinculos.loading

  const error = requisicaoSimulados.error ?? requisicaoTentativas.error ?? requisicaoVinculos.error

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
    tendenciaPorDisciplina,
    tentativas: requisicaoTentativas.data ?? [],
    loading,
    error,
    reload: requisicaoSimulados.reload,
  }
}
