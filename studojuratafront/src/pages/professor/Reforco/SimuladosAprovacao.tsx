import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, ClipboardList, Search, Sparkles, Zap } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header, CamposFiltro, CampoFiltro, BotaoFiltro } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { ia as servicoIa } from '../../../services/ia'
import { alunos as servicoAlunos, professores as servicoProfessores } from '../../../services/pessoas'
import { conteudosPlano } from '../../../services/planejamento'
import {
  questoes as servicoQuestoes,
  simuladoQuestoes,
  simulados as servicoSimulados,
} from '../../../services/simulados'
import { matriculas } from '../../../services/turmas'
import { formatarData, formatarPorcentagem } from '../../../utils/format'
import { ROTULO_MOTIVO_RECOMENDACAO } from '../../../utils/labels'
import type { MotivoRecomendacao } from '../../../types/ia'
import type { Coluna } from '../../../components/ui/DataTable/types'

type TipoFiltro = 'disciplina' | 'aluno'
type Aba = 'aprovacao' | 'proximas'

interface FiltroAplicado {
  turmaId: number
  tipo: TipoFiltro
  especificoId: number
}

interface LinhaAprovacao {
  simuladoId: number
  titulo: string
  disciplinaRotulo: string
  alunoRotulo: string
  motivoRotulo: string
  dataCriacao?: string
  /** Dias após o prazo de revisão (SimuladoGeradoIA.prazoLancamento) sem o simulado ter sido lançado; null = sem vínculo IA ou ainda no prazo. */
  atrasoDias: number | null
}

/**
 * Item da fila de geração automática: a IA gera sozinha, no prazo calculado.
 * `dataGeracaoPrevista` vem:
 * - de RevisaoConteudo.dataProximoReforco (repetição espaçada) quando existe
 *   — pode ser uma data futura, não só "devida hoje";
 * - de hoje, pra baixo aproveitamento (não tem agenda própria: é um limiar
 *   de nota já atingido agora, não uma data calculada).
 */
interface ProximaGeracaoIA {
  alunoId: number
  alunoNome: string
  conteudoPlanoId: number
  conteudoTitulo: string
  motivos: MotivoRecomendacao[]
  dataGeracaoPrevista: string
  taxaAcerto?: number
}

function rotuloMotivos(motivos?: MotivoRecomendacao[]): string {
  if (!motivos || motivos.length === 0) return '—'
  return motivos.map((motivo) => ROTULO_MOTIVO_RECOMENDACAO[motivo]).join(', ')
}

/** Dias corridos após o prazo, ou null se ainda não venceu (ou não tem prazo). */
function atrasoEmDias(prazoLancamento?: string): number | null {
  if (!prazoLancamento) return null

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const prazo = new Date(`${prazoLancamento}T00:00:00`)
  const dias = Math.floor((hoje.getTime() - prazo.getTime()) / 86_400_000)

  return dias > 0 ? dias : null
}

export default function SimuladosAprovacao() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { professorId } = useProfessorLogado()

  const [gerando, setGerando] = useState<string | null>(null)

  const [aba, setAba] = useState<Aba>('aprovacao')

  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [tipo, setTipo] = useState<TipoFiltro | null>(null)
  const [especificoId, setEspecificoId] = useState<number | null>(null)
  const [filtro, setFiltro] = useState<FiltroAplicado | null>(null)

  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const opcoesTurmas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (vinculo.turma) unicas.set(vinculo.turma.id, vinculo.turma.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data])

  const opcoesTipo: { value: TipoFiltro; label: string }[] = [
    { value: 'disciplina', label: 'Disciplina' },
    { value: 'aluno', label: 'Aluno' },
  ]

  const disciplinasDaTurma = useMemo(
    () =>
      (requisicaoVinculos.data ?? [])
        .filter((vinculo) => vinculo.turma?.id === turmaId && vinculo.disciplina)
        .map((vinculo) => ({ value: vinculo.disciplina!.id, label: vinculo.disciplina?.titulo ?? '—' })),
    [requisicaoVinculos.data, turmaId],
  )

  const requisicaoMatriculasTurma = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) && tipo === 'aluno' },
  )

  const opcoesEspecifico = useMemo(() => {
    if (tipo === 'disciplina') return disciplinasDaTurma

    if (tipo === 'aluno') {
      return (requisicaoMatriculasTurma.data ?? []).map((matricula) => ({
        value: matricula.aluno.id,
        label: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
      }))
    }

    return []
  }, [tipo, disciplinasDaTurma, requisicaoMatriculasTurma.data])

  function buscar() {
    if (!turmaId || !tipo || !especificoId) {
      toast.warning('Selecione turma, tipo de filtro e o item específico antes de buscar.')
      return
    }

    setFiltro({ turmaId, tipo, especificoId })
  }

  // Sempre ativas — a tela abre com a lista completa (todas as turmas do
  // professor), sem exigir filtro antes de mostrar algo.
  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoPendentes = useRequisicao(() => servicoQuestoes.listarPendentes(), [])
  const requisicaoSimuladoQuestoes = useRequisicao(() => simuladoQuestoes.listar(), [])
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])
  // Pendente, o simulado ainda não tem SimuladoAluno: esta é a única fonte do aluno.
  const requisicaoVinculosIA = useRequisicao(() => servicoIa.listarSimuladosGerados(), [])

  const linhas = useMemo<LinhaAprovacao[]>(() => {
    const turmasDoProfessor = new Set((requisicaoVinculos.data ?? []).map((v) => v.turma?.id))

    function nomeDisciplina(disciplinaId?: number | null) {
      return (requisicaoVinculos.data ?? []).find((v) => v.disciplina?.id === disciplinaId)?.disciplina?.titulo ?? '—'
    }

    const vinculoPorSimulado = new Map(
      (requisicaoVinculosIA.data ?? []).map((vinculo) => [vinculo.simuladoId, vinculo]),
    )

    function nomeAluno(alunoId?: number) {
      if (!alunoId) return '—'
      return (requisicaoAlunos.data ?? []).find((aluno) => aluno.id === alunoId)?.pessoa?.nome ?? '—'
    }

    const idsPendentes = new Set((requisicaoPendentes.data ?? []).map((questao) => questao.id))
    const simuladosComPendencia = new Set(
      (requisicaoSimuladoQuestoes.data ?? [])
        .filter((vinculo) => idsPendentes.has(vinculo.questaoId))
        .map((vinculo) => vinculo.simuladoId),
    )

    let simulados = (requisicaoSimulados.data ?? []).filter(
      (simulado) =>
        simuladosComPendencia.has(simulado.id) &&
        turmasDoProfessor.has(simulado.turmaId ?? undefined) &&
        (!filtro || simulado.turmaId === filtro.turmaId),
    )

    if (filtro?.tipo === 'disciplina') {
      simulados = simulados.filter((simulado) => simulado.disciplinaId === filtro.especificoId)
    } else if (filtro?.tipo === 'aluno') {
      simulados = simulados.filter(
        (simulado) => vinculoPorSimulado.get(simulado.id)?.alunoId === filtro.especificoId,
      )
    }

    return simulados.map((simulado) => {
      const vinculo = vinculoPorSimulado.get(simulado.id)
      return {
        simuladoId: simulado.id,
        titulo: simulado.titulo,
        disciplinaRotulo: nomeDisciplina(simulado.disciplinaId),
        alunoRotulo: nomeAluno(vinculo?.alunoId),
        motivoRotulo: rotuloMotivos(vinculo?.motivos),
        dataCriacao: simulado.createdAt,
        atrasoDias: atrasoEmDias(vinculo?.prazoLancamento),
      }
    })
  }, [
    filtro,
    requisicaoSimulados.data,
    requisicaoPendentes.data,
    requisicaoSimuladoQuestoes.data,
    requisicaoVinculosIA.data,
    requisicaoAlunos.data,
    requisicaoVinculos.data,
  ])

  // Só existem endpoints por aluno.
  const requisicaoMatriculasGerais = useRequisicao(() => matriculas.listar(), [])
  const requisicaoConteudos = useRequisicao(() => conteudosPlano.listar(), [])

  const alunosDoProfessor = useMemo(() => {
    const turmasDoProfessor = new Set((requisicaoVinculos.data ?? []).map((vinculo) => vinculo.turma?.id))
    const mapa = new Map<number, string>()

    ;(requisicaoMatriculasGerais.data ?? []).forEach((matricula) => {
      if (matricula.status !== 'ATIVA' || !turmasDoProfessor.has(matricula.turma?.id)) return
      mapa.set(matricula.aluno.id, matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`)
    })

    return mapa
  }, [requisicaoVinculos.data, requisicaoMatriculasGerais.data])

  const requisicaoProximasGeracoes = useRequisicao(
    async () => {
      const entradas = [...alunosDoProfessor.entries()]
      if (entradas.length === 0) return []

      const [revisoesPorAluno, recomendacoesPorAluno] = await Promise.all([
        Promise.all(entradas.map(([alunoId]) => servicoIa.revisoesPorAluno(alunoId))),
        Promise.all(entradas.map(([alunoId]) => servicoIa.recomendacoesPorAluno(alunoId))),
      ])

      const conteudos = requisicaoConteudos.data ?? []
      const tituloConteudo = (conteudoPlanoId: number) =>
        conteudos.find((conteudo) => conteudo.id === conteudoPlanoId)?.titulo ?? `Conteúdo ${conteudoPlanoId}`

      // Mesma chave dos jobs do back (aluno+conteúdo+prazo): dataProximoReforco
      // só muda quando o professor revisa, então sem isto o item nunca sairia da lista.
      const jaGerado = new Set(
        (requisicaoVinculosIA.data ?? []).map((vinculo) => `${vinculo.alunoId}-${vinculo.conteudoPlanoId}-${vinculo.prazoLancamento}`),
      )

      const hoje = new Date().toISOString().slice(0, 10)
      const porChave = new Map<string, ProximaGeracaoIA>()

      entradas.forEach(([alunoId, alunoNome], indice) => {
        // Revisões dominadas (dataProximoReforco null) não entram.
        revisoesPorAluno[indice]
          .filter((revisao) => revisao.dataProximoReforco && !jaGerado.has(`${alunoId}-${revisao.conteudoPlanoId}-${revisao.dataProximoReforco}`))
          .forEach((revisao) => {
            porChave.set(`${alunoId}-${revisao.conteudoPlanoId}`, {
              alunoId,
              alunoNome,
              conteudoPlanoId: revisao.conteudoPlanoId,
              conteudoTitulo: tituloConteudo(revisao.conteudoPlanoId),
              motivos: ['REPETICAO_ESPACADA'],
              dataGeracaoPrevista: revisao.dataProximoReforco as string,
            })
          })

        // Baixo aproveitamento não tem agenda: entra para hoje.
        recomendacoesPorAluno[indice].forEach((recomendacao) => {
          const dataPrevista = recomendacao.dataProximoReforco ?? hoje
          if (jaGerado.has(`${alunoId}-${recomendacao.conteudoPlanoId}-${dataPrevista}`)) return

          const chave = `${alunoId}-${recomendacao.conteudoPlanoId}`
          const existente = porChave.get(chave)

          if (existente) {
            porChave.set(chave, {
              ...existente,
              motivos: [...new Set([...existente.motivos, ...recomendacao.motivos])],
              taxaAcerto: recomendacao.taxaAcerto ?? existente.taxaAcerto,
            })
            return
          }

          porChave.set(chave, {
            alunoId,
            alunoNome,
            conteudoPlanoId: recomendacao.conteudoPlanoId,
            conteudoTitulo: recomendacao.conteudoTitulo,
            motivos: recomendacao.motivos,
            dataGeracaoPrevista: dataPrevista,
            taxaAcerto: recomendacao.taxaAcerto,
          })
        })
      })

      return [...porChave.values()].sort(
        (a, b) => new Date(a.dataGeracaoPrevista).getTime() - new Date(b.dataGeracaoPrevista).getTime(),
      )
    },
    [alunosDoProfessor, requisicaoConteudos.data, requisicaoVinculosIA.data],
    {
      ativo:
        !requisicaoVinculos.loading &&
        !requisicaoMatriculasGerais.loading &&
        !requisicaoConteudos.loading &&
        !requisicaoVinculosIA.loading,
    },
  )

  const carregando =
    requisicaoSimulados.loading ||
    requisicaoPendentes.loading ||
    requisicaoSimuladoQuestoes.loading ||
    requisicaoAlunos.loading ||
    requisicaoVinculosIA.loading

  const colunas: Coluna<LinhaAprovacao>[] = [
    { key: 'titulo', cabecalho: 'Título', render: (linha) => linha.titulo },
    { key: 'disciplina', cabecalho: 'Disciplina', render: (linha) => linha.disciplinaRotulo },
    { key: 'aluno', cabecalho: 'Aluno', render: (linha) => linha.alunoRotulo },
    { key: 'motivo', cabecalho: 'Motivo', render: (linha) => linha.motivoRotulo },
    {
      key: 'data',
      cabecalho: 'Data criação',
      render: (linha) => formatarData(linha.dataCriacao),
    },
    {
      key: 'atraso',
      cabecalho: 'Atraso na revisão',
      ordenavel: true,
      valorOrdenacao: (linha) => linha.atrasoDias ?? -1,
      render: (linha) =>
        linha.atrasoDias !== null ? (
          <Tag variant="error">{linha.atrasoDias} dia(s)</Tag>
        ) : (
          '—'
        ),
    },
  ]

  /** Adianta a geração de um item sem esperar a data prevista; o resultado vai para "Aguardando aprovação". */
  async function gerarAgora(item: ProximaGeracaoIA) {
    const chave = `${item.alunoId}-${item.conteudoPlanoId}`

    await confirmar({
      titulo: 'Gerar simulado agora?',
      descricao: `Um simulado de reforço para ${item.alunoNome} (${item.conteudoTitulo}) será gerado imediatamente, sem esperar a data prevista. Ele entra na aba "Aguardando aprovação" para revisão.`,
      rotuloConfirmar: 'Gerar agora',
      aoConfirmar: async () => {
        setGerando(chave)

        try {
          await servicoIa.gerarSimulado({
            alunoId: item.alunoId,
            conteudoPlanoId: item.conteudoPlanoId,
            motivos: item.motivos,
          })

          toast.success('Simulado gerado', 'Já está disponível em "Aguardando aprovação" para revisão.')

          await Promise.all([
            requisicaoProximasGeracoes.reload(),
            requisicaoVinculosIA.reload(),
            requisicaoSimulados.reload(),
            requisicaoPendentes.reload(),
            requisicaoSimuladoQuestoes.reload(),
          ])
          setAba('aprovacao')
        } catch (erroGerar) {
          toast.error(
            'Não foi possível gerar',
            erroGerar instanceof ApiError ? erroGerar.message : undefined,
          )
        } finally {
          setGerando(null)
        }
      },
    })
  }

  const colunasProximasGeracoes: Coluna<ProximaGeracaoIA>[] = [
    { key: 'aluno', cabecalho: 'Aluno', render: (item) => item.alunoNome },
    { key: 'conteudo', cabecalho: 'Conteúdo', render: (item) => item.conteudoTitulo },
    { key: 'motivo', cabecalho: 'Motivo', render: (item) => rotuloMotivos(item.motivos) },
    {
      key: 'aproveitamento',
      cabecalho: 'Aproveitamento',
      render: (item) => (typeof item.taxaAcerto === 'number' ? formatarPorcentagem(item.taxaAcerto * 100) : '—'),
    },
    {
      key: 'dataGeracao',
      cabecalho: 'Geração prevista',
      ordenavel: true,
      valorOrdenacao: (item) => item.dataGeracaoPrevista,
      render: (item) => formatarData(item.dataGeracaoPrevista),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Simulados aguardando aprovação"
        voltarPara="/professor/reforco"
        rotuloVoltar="Módulo de reforço"
        filtros={
          <CamposFiltro>
            <CampoFiltro $largura="211px">
              <Select
                placeholder="Turma"
                options={opcoesTurmas}
                value={turmaId}
                loading={requisicaoVinculos.loading}
                emptyText="Você não leciona em nenhuma turma"
                onChange={(valor) => {
                  setTurmaId(valor)
                  setEspecificoId(null)
                }}
              />
            </CampoFiltro>

            <CampoFiltro $largura="211px">
              <Select<TipoFiltro>
                placeholder="Disciplina / Aluno"
                options={opcoesTipo}
                value={tipo}
                emptyText="—"
                onChange={(valor) => {
                  setTipo(valor)
                  setEspecificoId(null)
                }}
              />
            </CampoFiltro>

            <CampoFiltro $largura="211px">
              <Select
                placeholder="Disc/Aluno (Específico)"
                options={opcoesEspecifico}
                value={especificoId}
                disabled={!tipo || !turmaId}
                loading={tipo === 'aluno' && requisicaoMatriculasTurma.loading}
                emptyText="Selecione turma e tipo primeiro"
                onChange={setEspecificoId}
              />
            </CampoFiltro>

            <BotaoFiltro>
              <Button size="large" icon={<Search />} onClick={buscar}>
                Buscar
              </Button>
            </BotaoFiltro>
          </CamposFiltro>
        }
      />

      <Tab<Aba>
        rotuloAcessivel="Seções de simulados via IA"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'aprovacao', label: 'Aguardando aprovação', contador: linhas.length },
          {
            value: 'proximas',
            label: 'Próximas gerações da IA',
            contador: requisicaoProximasGeracoes.data?.length,
          },
        ]}
      />

      {aba === 'aprovacao' &&
        (carregando ? (
          <Skeleton $altura="240px" $raio="8px" />
        ) : (
          <Card semPadding>
            <DataTable
              descricao="Simulados aguardando aprovação"
              columns={colunas}
              data={linhas}
              rowKey={(linha) => linha.simuladoId}
              empty={{
                titulo: 'Nada para aprovar',
                descricao: filtro
                  ? 'Nenhum simulado com questões pendentes para esse filtro.'
                  : 'Nenhum simulado seu tem questões pendentes de aprovação.',
                icon: <ClipboardCheck />,
              }}
              actions={(linha) => (
                <Button
                  variant="subtle"
                  size="small"
                  icon={<ClipboardList />}
                  onClick={() => navegar(`/professor/reforco/aprovacao/${linha.simuladoId}`)}
                >
                  Detalhar
                </Button>
              )}
            />
          </Card>
        ))}

      {aba === 'proximas' && (
        <Card semPadding>
          <DataTable
            descricao="Próximas gerações automáticas de simulados via IA"
            columns={colunasProximasGeracoes}
            data={requisicaoProximasGeracoes.data ?? []}
            rowKey={(item) => `${item.alunoId}-${item.conteudoPlanoId}`}
            loading={requisicaoProximasGeracoes.loading}
            error={requisicaoProximasGeracoes.error}
            onReload={requisicaoProximasGeracoes.reload}
            empty={{
              titulo: 'Nada agendado',
              descricao:
                'Nenhum aluno das suas turmas está com repetição espaçada agendada ou aproveitamento baixo no momento.',
              icon: <Sparkles />,
            }}
            actions={(item) => (
              <Button
                variant="subtle"
                size="small"
                icon={<Zap />}
                loading={gerando === `${item.alunoId}-${item.conteudoPlanoId}`}
                onClick={() => gerarAgora(item)}
              >
                Gerar agora
              </Button>
            )}
          />
        </Card>
      )}
    </Layout>
  )
}
