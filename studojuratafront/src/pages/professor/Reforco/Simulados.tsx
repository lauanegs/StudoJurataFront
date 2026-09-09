import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, ClipboardCheck, FileText, Pencil, Plus, Rocket, Square } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlertaDesempenhoCard } from '../../../components/ui/AlertaDesempenhoCard'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  disciplinas as servicoDisciplinas,
  ia as servicoIa,
  professores as servicoProfessores,
  questoes as servicoQuestoes,
  simuladoAlunos,
  simuladoQuestoes,
  simulados as servicoSimulados,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
import { formatarDataHora, normalizar } from '../../../utils/format'
import { ROTULO_DESTINACAO, ROTULO_STATUS_SIMULADO, STATUS_SIMULADO_VARIANT } from '../../../utils/labels'
import { theme as tokens } from '../../../styles/theme'
import type { SimuladoResponse, StatusSimulado } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

type Filtro = 'todos' | StatusSimulado

export default function Simulados() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { professorId } = useProfessorLogado()

  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)
  const [processando, setProcessando] = useState<number | null>(null)

  const { data, loading, error, reload } = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoTurmas = useRequisicao(() => servicoTurmas.listar(), [])
  const requisicaoTentativas = useRequisicao(() => simuladoAlunos.listar(), [])
  const requisicaoQuestoesPendentes = useRequisicao(() => servicoQuestoes.listarPendentes(), [])
  const requisicaoSimuladoQuestoes = useRequisicao(() => simuladoQuestoes.listar(), [])
  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )
  // Vínculo aluno/conteúdo/motivo/prazo de cada simulado gerado pela IA —
  // usado só pra detectar os que passaram do prazo sem ter sido lançados
  // (ver simuladosAtrasados). Detalhamento completo fica na tela de
  // aprovação (SimuladosAprovacao.tsx).
  const requisicaoVinculosIA = useRequisicao(() => servicoIa.listarSimuladosGerados(), [])

  // O botão "Simulados para aprovação" leva pra SimuladosAprovacao.tsx, que
  // lista SIMULADOS, não questões — contar questoesPendentes.length aqui
  // direto não bate com o total real de simulados naquela tela (um simulado
  // pode ter várias questões pendentes, inflando o número; e a contagem
  // também não é filtrada pelas turmas deste professor). Mesma lógica de
  // agrupamento da tela de aprovação, só que contando em vez de listar.
  const pendentes = useMemo(() => {
    const turmasDoProfessor = new Set((requisicaoVinculos.data ?? []).map((vinculo) => vinculo.turma?.id))
    const idsQuestoesPendentes = new Set((requisicaoQuestoesPendentes.data ?? []).map((questao) => questao.id))

    const simuladosComPendencia = new Set(
      (requisicaoSimuladoQuestoes.data ?? [])
        .filter((vinculo) => idsQuestoesPendentes.has(vinculo.questaoId))
        .map((vinculo) => vinculo.simuladoId),
    )

    return (data ?? []).filter(
      (simulado) => simuladosComPendencia.has(simulado.id) && turmasDoProfessor.has(simulado.turmaId ?? undefined),
    ).length
  }, [requisicaoVinculos.data, requisicaoQuestoesPendentes.data, requisicaoSimuladoQuestoes.data, data])

  // Simulados gerados pela IA que passaram do prazo de revisão sem terem
  // sido lançados (Simulado.status ainda RASCUNHO).
  const simuladosAtrasados = useMemo(() => {
    const hojeISO = new Date().toISOString().slice(0, 10)
    const simuladosPorId = new Map((data ?? []).map((simulado) => [simulado.id, simulado]))

    return (requisicaoVinculosIA.data ?? []).filter((vinculo) => {
      const simulado = simuladosPorId.get(vinculo.simuladoId)
      return simulado?.status === 'RASCUNHO' && vinculo.prazoLancamento < hojeISO
    })
  }, [requisicaoVinculosIA.data, data])

  const nomeDisciplina = (id?: number | null) =>
    (requisicaoDisciplinas.data ?? []).find((disciplina) => disciplina.id === id)?.titulo ?? '—'

  const nomeTurma = (id?: number | null) =>
    (requisicaoTurmas.data ?? []).find((turma) => turma.id === id)?.titulo ?? '—'

  /** Participação = tentativas concluídas / tentativas criadas no lançamento. */
  const participacao = useMemo(() => {
    const mapa = new Map<number, { concluidas: number; total: number }>()

    ;(requisicaoTentativas.data ?? []).forEach((tentativa) => {
      const atual = mapa.get(tentativa.simuladoId) ?? { concluidas: 0, total: 0 }

      mapa.set(tentativa.simuladoId, {
        concluidas: atual.concluidas + (tentativa.status === 'CONCLUIDO' ? 1 : 0),
        total: atual.total + 1,
      })
    })

    return mapa
  }, [requisicaoTentativas.data])

  const contadores = useMemo(() => {
    const lista = data ?? []

    return {
      todos: lista.length,
      RASCUNHO: lista.filter((simulado) => simulado.status === 'RASCUNHO').length,
      PUBLICADO: lista.filter((simulado) => simulado.status === 'PUBLICADO').length,
      ENCERRADO: lista.filter((simulado) => simulado.status === 'ENCERRADO').length,
    }
  }, [data])

  const filtrados = useMemo(() => {
    let lista = data ?? []

    if (filtro !== 'todos') lista = lista.filter((simulado) => simulado.status === filtro)

    if (buscaAtrasada.trim()) {
      const termo = normalizar(buscaAtrasada)
      lista = lista.filter((simulado) => normalizar(simulado.titulo).includes(termo))
    }

    return [...lista].sort((a, b) => b.id - a.id)
  }, [data, filtro, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)

  async function lancar(simulado: SimuladoResponse) {
    await confirmar({
      titulo: 'Lançar simulado?',
      descricao:
        simulado.tipoDestinacao === 'TODOS'
          ? 'Todos os alunos com matrícula ativa na turma receberão o simulado.'
          : 'Os alunos selecionados receberão o simulado. Depois de lançado, o conteúdo não deve mais ser alterado.',
      rotuloConfirmar: 'Lançar',
      aoConfirmar: async () => {
        setProcessando(simulado.id)

        try {
          await servicoSimulados.lancar(simulado.id)
          toast.success('Simulado lançado', 'Os alunos já podem iniciar as tentativas.')
          await Promise.all([reload(), requisicaoTentativas.reload()])
        } catch (erroLancar) {
          toast.error(
            'Não foi possível lançar',
            erroLancar instanceof ApiError ? erroLancar.message : undefined,
          )
        } finally {
          setProcessando(null)
        }
      },
    })
  }

  async function encerrar(simulado: SimuladoResponse) {
    await confirmar({
      titulo: 'Encerrar simulado?',
      descricao: 'Nenhuma nova tentativa poderá ser iniciada. As tentativas em andamento são preservadas.',
      rotuloConfirmar: 'Encerrar',
      tone: 'danger',
      aoConfirmar: async () => {
        setProcessando(simulado.id)

        try {
          await servicoSimulados.encerrar(simulado.id)
          toast.success('Simulado encerrado')
          await reload()
        } catch (erroEncerrar) {
          toast.error(
            'Não foi possível encerrar',
            erroEncerrar instanceof ApiError ? erroEncerrar.message : undefined,
          )
        } finally {
          setProcessando(null)
        }
      },
    })
  }

  const colunas: Coluna<SimuladoResponse>[] = [
    {
      key: 'titulo',
      cabecalho: 'Título',
      ordenavel: true,
      valorOrdenacao: (simulado) => simulado.titulo,
      render: (simulado) => simulado.titulo,
    },
    {
      key: 'disciplina',
      cabecalho: 'Disciplina',
      render: (simulado) => <Tag variant="purple">{nomeDisciplina(simulado.disciplinaId)}</Tag>,
    },
    {
      key: 'turma',
      cabecalho: 'Turma',
      ocultarEmTelaPequena: true,
      render: (simulado) =>
        simulado.turmaId ? (
          nomeTurma(simulado.turmaId)
        ) : (
          <span style={{ color: tokens.colors.textDisabled }}>Sem turma</span>
        ),
    },
    {
      key: 'destinacao',
      cabecalho: 'Destinação',
      ocultarEmTelaPequena: true,
      render: (simulado) => ROTULO_DESTINACAO[simulado.tipoDestinacao],
    },
    {
      key: 'participacao',
      cabecalho: 'Participação',
      alinhamento: 'center',
      render: (simulado) => {
        const valores = participacao.get(simulado.id)
        if (!valores || valores.total === 0) return <span style={{ color: tokens.colors.textDisabled }}>—</span>

        const completo = valores.concluidas === valores.total

        return (
          <Tag variant={completo ? 'success' : 'warning'}>
            {valores.concluidas}/{valores.total}
          </Tag>
        )
      },
    },
    {
      key: 'janela',
      cabecalho: 'Janela',
      ocultarEmTelaPequena: true,
      render: (simulado) =>
        simulado.dataInicio ? formatarDataHora(simulado.dataInicio) : 'sem data definida',
    },
    {
      key: 'status',
      cabecalho: 'Status',
      render: (simulado) =>
        simulado.status ? (
          <Tag variant={STATUS_SIMULADO_VARIANT[simulado.status]}>
            {ROTULO_STATUS_SIMULADO[simulado.status]}
          </Tag>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Módulo de Reforço"
        actions={
          <>
            <Button
              size="large"
              variant="secondary"
              icon={<ClipboardCheck />}
              onClick={() => navegar('/professor/reforco/aprovacao')}
            >
              Simulados para aprovação{pendentes > 0 ? ` (${pendentes})` : ''}
            </Button>
            <Button
              size="large"
              variant="secondary"
              icon={<BookOpen />}
              onClick={() => navegar('/professor/reforco/questoes?aba=aprovadas')}
            >
              Banco de questões
            </Button>
            <Button size="large" icon={<Plus />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
              Novo simulado
            </Button>
          </>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar simulado..." />}
      />

      {simuladosAtrasados.length > 0 && (
        <AlertaDesempenhoCard
          titulo="Revisões de reforço atrasadas"
          descricao={`${simuladosAtrasados.length} simulado(s) gerado(s) pela IA passou(aram) do prazo de revisão e ainda não ${
            simuladosAtrasados.length === 1 ? 'foi lançado' : 'foram lançados'
          }.`}
          acao={
            <Button
              size="small"
              icon={<ClipboardCheck />}
              onClick={() => navegar('/professor/reforco/aprovacao')}
            >
              Ver simulados
            </Button>
          }
        />
      )}

      <Tab<Filtro>
        rotuloAcessivel="Filtrar simulados"
        value={filtro}
        onChange={setFiltro}
        options={[
          { value: 'todos', label: 'Todos', contador: contadores.todos },
          { value: 'RASCUNHO', label: 'Rascunhos', contador: contadores.RASCUNHO },
          { value: 'PUBLICADO', label: 'Publicados', contador: contadores.PUBLICADO },
          { value: 'ENCERRADO', label: 'Encerrados', contador: contadores.ENCERRADO },
        ]}
      />

      <DataTable
        descricao="Lista de simulados"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(simulado) => simulado.id}
        loading={loading}
        error={error}
        onReload={reload}
        paginacao={{
          pagina: paginacao.pagina,
          totalPaginas: paginacao.totalPaginas,
          label: paginacao.label,
          temAnterior: paginacao.temAnterior,
          temProxima: paginacao.temProxima,
          onPrevious: paginacao.anterior,
          onNext: paginacao.proxima,
        }}
        empty={{
          titulo: busca || filtro !== 'todos' ? 'Nenhum simulado encontrado' : 'Nenhum simulado criado',
          descricao:
            busca || filtro !== 'todos'
              ? 'Ajuste o filtro ou limpe a busca.'
              : 'Monte um simulado com questões próprias ou geradas pela IA.',
          icon: <FileText />,
          acao: !busca && filtro === 'todos' && (
            <Button icon={<Plus />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
              Criar simulado
            </Button>
          ),
        }}
        actions={(simulado) => (
          <>
            <Button
              variant="subtle"
              size="small"
              icon={<BarChart3 />}
              onClick={() => navegar(`/professor/reforco/simulados/${simulado.id}/resultados`)}
            >
              Resultados
            </Button>

            {simulado.status === 'RASCUNHO' && (
              <>
                <Button
                  variant="subtle"
                  size="small"
                  icon={<Pencil />}
                  onClick={() => navegar(`/professor/reforco/simulados/${simulado.id}`)}
                >
                  Editar
                </Button>
                <Button
                  variant="subtle"
                  size="small"
                  icon={<Rocket />}
                  disabled={processando === simulado.id}
                  onClick={() => lancar(simulado)}
                >
                  Lançar
                </Button>
              </>
            )}

            {simulado.status === 'PUBLICADO' && (
              <Button
                variant="subtle"
                size="small"
                icon={<Square />}
                disabled={processando === simulado.id}
                onClick={() => encerrar(simulado)}
              >
                Encerrar
              </Button>
            )}
          </>
        )}
      />
    </Layout>
  )
}
