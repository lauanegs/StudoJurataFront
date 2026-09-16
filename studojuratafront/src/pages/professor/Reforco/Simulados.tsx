import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { BarChart3, BookOpen, ClipboardCheck, FileText, Pencil, Plus, Rocket, Square } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlertaDesempenhoCard } from '../../../components/ui/AlertaDesempenhoCard'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
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
import { ROTULO_STATUS_SIMULADO, STATUS_SIMULADO_VARIANT } from '../../../utils/labels'
import { theme as tokens } from '../../../styles/theme'
import type { SimuladoResponse, StatusSimulado } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

type Filtro = 'todos' | StatusSimulado

/* Selects de Turma/Disciplina "flutuantes" abaixo das abas (pedido
   explícito) — mesmo padrão de LinhaAcaoFlutuante usado em TurmaFormulario
   (ADM): soltos no fundo cinza da página, à direita, fora do card branco da
   tabela. */
const LinhaFiltrosFlutuante = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const CampoLargura = styled.div`
  width: 211px;
`

export default function Simulados() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { professorId } = useProfessorLogado()

  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [turmaFiltroId, setTurmaFiltroId] = useState<number | null>(null)
  const [disciplinaFiltroId, setDisciplinaFiltroId] = useState<number | null>(null)
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

  const turmasDoProfessor = useMemo(
    () => new Set((requisicaoVinculos.data ?? []).map((vinculo) => vinculo.turma?.id)),
    [requisicaoVinculos.data],
  )

  // Escopo por professor (pedido explícito): cada professor só vê/controla
  // os simulados vinculados às turmas em que leciona — o banco de questões
  // continua público (não tem esse filtro). Simulado.turma é opcional
  // (rascunho ainda sem turma escolhida) — sem turma definida, fica visível
  // até ele mesmo escolher a turma e virar "de alguém".
  const simuladosDoProfessor = useMemo(
    () => (data ?? []).filter((simulado) => !simulado.turmaId || turmasDoProfessor.has(simulado.turmaId)),
    [data, turmasDoProfessor],
  )

  // IDs de simulado com ao menos uma questão ainda PENDENTE — enquanto isso
  // for verdade, o simulado só pode ser mexido pela tela de aprovação
  // (SimuladosAprovacao.tsx/AprovarSimulado.tsx), nunca por Editar/Lançar
  // aqui: editar/lançar direto puxaria pra revisão um simulado que ainda não
  // passou pela aprovação questão por questão.
  const simuladosComPendencia = useMemo(() => {
    const idsQuestoesPendentes = new Set((requisicaoQuestoesPendentes.data ?? []).map((questao) => questao.id))

    return new Set(
      (requisicaoSimuladoQuestoes.data ?? [])
        .filter((vinculo) => idsQuestoesPendentes.has(vinculo.questaoId))
        .map((vinculo) => vinculo.simuladoId),
    )
  }, [requisicaoQuestoesPendentes.data, requisicaoSimuladoQuestoes.data])

  // O botão "Simulados para aprovação" leva pra SimuladosAprovacao.tsx, que
  // lista SIMULADOS, não questões — contar questoesPendentes.length aqui
  // direto não bate com o total real de simulados naquela tela (um simulado
  // pode ter várias questões pendentes, inflando o número; e a contagem
  // também não é filtrada pelas turmas deste professor). Mesma lógica de
  // agrupamento da tela de aprovação, só que contando em vez de listar.
  const pendentes = useMemo(
    () => simuladosDoProfessor.filter((simulado) => simuladosComPendencia.has(simulado.id)).length,
    [simuladosDoProfessor, simuladosComPendencia],
  )

  // Simulados gerados pela IA que passaram do prazo de revisão sem terem
  // sido lançados (Simulado.status ainda RASCUNHO).
  const simuladosAtrasados = useMemo(() => {
    const hojeISO = new Date().toISOString().slice(0, 10)
    const simuladosPorId = new Map(simuladosDoProfessor.map((simulado) => [simulado.id, simulado]))

    return (requisicaoVinculosIA.data ?? []).filter((vinculo) => {
      const simulado = simuladosPorId.get(vinculo.simuladoId)
      return simulado?.status === 'RASCUNHO' && vinculo.prazoLancamento < hojeISO
    })
  }, [requisicaoVinculosIA.data, simuladosDoProfessor])

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
    const lista = simuladosDoProfessor

    return {
      todos: lista.length,
      RASCUNHO: lista.filter((simulado) => simulado.status === 'RASCUNHO').length,
      PUBLICADO: lista.filter((simulado) => simulado.status === 'PUBLICADO').length,
      ENCERRADO: lista.filter((simulado) => simulado.status === 'ENCERRADO').length,
    }
  }, [simuladosDoProfessor])

  const opcoesTurmasFiltro = useMemo(
    () =>
      (requisicaoTurmas.data ?? [])
        .filter((turma) => turmasDoProfessor.has(turma.id))
        .map((turma) => ({ value: turma.id, label: turma.titulo })),
    [requisicaoTurmas.data, turmasDoProfessor],
  )

  const opcoesDisciplinasFiltro = useMemo(
    () => (requisicaoDisciplinas.data ?? []).map((disciplina) => ({ value: disciplina.id, label: disciplina.titulo })),
    [requisicaoDisciplinas.data],
  )

  const filtrados = useMemo(() => {
    let lista = simuladosDoProfessor

    if (filtro !== 'todos') lista = lista.filter((simulado) => simulado.status === filtro)
    if (turmaFiltroId) lista = lista.filter((simulado) => simulado.turmaId === turmaFiltroId)
    if (disciplinaFiltroId) lista = lista.filter((simulado) => simulado.disciplinaId === disciplinaFiltroId)

    return [...lista].sort((a, b) => b.id - a.id)
  }, [simuladosDoProfessor, filtro, turmaFiltroId, disciplinaFiltroId])

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
      render: (simulado) => <Tag variant="neutral">{nomeDisciplina(simulado.disciplinaId)}</Tag>,
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
              Adicionar simulado
            </Button>
          </>
        }
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

      <LinhaFiltrosFlutuante>
        <CampoLargura>
          <Select<number>
            placeholder="Todas as turmas"
            options={opcoesTurmasFiltro}
            value={turmaFiltroId}
            clearable
            searchable
            onChange={setTurmaFiltroId}
          />
        </CampoLargura>
        <CampoLargura>
          <Select<number>
            placeholder="Todas as disciplinas"
            options={opcoesDisciplinasFiltro}
            value={disciplinaFiltroId}
            clearable
            searchable
            onChange={setDisciplinaFiltroId}
          />
        </CampoLargura>
      </LinhaFiltrosFlutuante>

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
          titulo:
            filtro !== 'todos' || turmaFiltroId || disciplinaFiltroId
              ? 'Nenhum simulado encontrado'
              : 'Nenhum simulado criado',
          descricao:
            filtro !== 'todos' || turmaFiltroId || disciplinaFiltroId
              ? 'Ajuste os filtros acima.'
              : 'Monte um simulado com questões próprias ou geradas pela IA.',
          icon: <FileText />,
          acao: filtro === 'todos' && !turmaFiltroId && !disciplinaFiltroId && (
            <Button icon={<Plus />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
              Cadastrar simulado
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

            {simulado.status === 'RASCUNHO' && simuladosComPendencia.has(simulado.id) && (
              <Button
                variant="subtle"
                size="small"
                icon={<ClipboardCheck />}
                onClick={() => navegar(`/professor/reforco/aprovacao/${simulado.id}`)}
              >
                Revisar questões
              </Button>
            )}

            {simulado.status === 'RASCUNHO' && !simuladosComPendencia.has(simulado.id) && (
              <>
                <Button
                  variant="subtle"
                  size="small"
                  icon={<Pencil />}
                  onClick={() => navegar(`/professor/reforco/simulados/${simulado.id}`)}
                >
                  Editar
                </Button>
                {/* Destinação ESPECIFICO precisa da lista de alunos escolhida
                    no momento do lançamento — essa tela não tem esse seletor,
                    só o editor completo tem (SimuladoFormulario). Lançar por
                    aqui sem alunos sempre falhava com 400. */}
                {simulado.tipoDestinacao === 'TODOS' && (
                  <Button
                    variant="subtle"
                    size="small"
                    icon={<Rocket />}
                    disabled={processando === simulado.id}
                    onClick={() => lancar(simulado)}
                  >
                    Lançar
                  </Button>
                )}
              </>
            )}

            {simulado.status === 'PUBLICADO' && (
              <>
                {/* Edição geral fica travada (SimuladoFormulario já trata isso),
                    mas "Disponível até" continua editável mesmo lançado — sem
                    este link não havia como chegar lá pela tela. */}
                <Button
                  variant="subtle"
                  size="small"
                  icon={<Pencil />}
                  onClick={() => navegar(`/professor/reforco/simulados/${simulado.id}`)}
                >
                  Disponibilidade
                </Button>
                <Button
                  variant="subtle"
                  size="small"
                  icon={<Square />}
                  disabled={processando === simulado.id}
                  onClick={() => encerrar(simulado)}
                >
                  Encerrar
                </Button>
              </>
            )}
          </>
        )}
      />
    </Layout>
  )
}
