import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { CheckCircle2, ClipboardList, Sparkles } from 'lucide-react'

import { Layout } from '../../components/layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { Header } from '../../components/ui/Header'
import { Select } from '../../components/ui/Select'
import { SimuladoIniciarCard } from '../../components/ui/SimuladoIniciarCard'
import { Tab } from '../../components/ui/Tab'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useAlunoLogado } from '../../hooks/usePerfilLogado'
import { usePaginacao } from '../../hooks/usePaginacao'
import { useRequisicao } from '../../hooks/useRequisicao'
import {
  disciplinas as servicoDisciplinas,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../services/endpoints'
import { formatarDataHora, formatarTempo } from '../../utils/format'
import type { SimuladoAlunoResponse } from '../../types'
import type { Coluna } from '../../components/ui/DataTable/types'

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Confirmado no Figma: select de disciplina + botão "Buscar" colados, na
   mesma linha, igual ao padrão já usado nas telas do professor (sem label
   flutuante acima do campo, senão o bloco do Select fica mais alto que o
   botão ao lado e a linha para de parecer alinhada). */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

/* O <Field> por baixo do Select pede width:100% do pai — dentro de um flex
   item sem largura própria isso força o cálculo de shrink-to-fit e o campo
   acaba quebrando de linha mesmo sobrando espaço. Uma largura fixa aqui
   (mesmo padrão já usado nos headers do professor) resolve. */
const CampoLargura = styled.div`
  width: 280px;
`

type Aba = 'aFazer' | 'realizados'

export default function AlunoReforco() {
  const navegar = useNavigate()
  const { alunoId, loading: carregandoAluno, error: erroAluno } = useAlunoLogado()

  const [aba, setAba] = useState<Aba>('aFazer')
  // Confirmado no Figma: o filtro só se aplica ao clicar em "Buscar" — a
  // seleção do campo (rascunho) fica separada do filtro de fato aplicado, que
  // começa nulo (lista completa, sem filtro).
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<number | null>(null)
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)

  const requisicaoTentativas = useRequisicao(
    () => simuladoAlunos.listarPorAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )
  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])

  const porSimulado = useMemo(
    () => new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado])),
    [requisicaoSimulados.data],
  )

  const nomeDisciplina = (id?: number | null) =>
    (requisicaoDisciplinas.data ?? []).find((disciplina) => disciplina.id === id)?.titulo

  const filtradas = useMemo(() => {
    const lista = requisicaoTentativas.data ?? []
    if (!disciplinaId) return lista

    return lista.filter((tentativa) => porSimulado.get(tentativa.simuladoId)?.disciplinaId === disciplinaId)
  }, [requisicaoTentativas.data, disciplinaId, porSimulado])

  const aFazer = filtradas.filter((tentativa) => tentativa.status !== 'CONCLUIDO')
  const realizados = filtradas.filter((tentativa) => tentativa.status === 'CONCLUIDO')

  const opcoesDisciplinas = useMemo(() => {
    const ids = new Set(
      (requisicaoTentativas.data ?? [])
        .map((tentativa) => porSimulado.get(tentativa.simuladoId)?.disciplinaId)
        .filter((id): id is number => Boolean(id)),
    )

    return (requisicaoDisciplinas.data ?? [])
      .filter((disciplina) => ids.has(disciplina.id))
      .map((disciplina) => ({ value: disciplina.id, label: disciplina.titulo ?? '—' }))
  }, [requisicaoTentativas.data, requisicaoDisciplinas.data, porSimulado])

  /** Fora da janela de datas, o simulado aparece mas não pode ser iniciado. */
  function disponibilidade(simuladoId: number) {
    const simulado = porSimulado.get(simuladoId)
    if (!simulado) return { indisponivel: true, motivo: 'Simulado indisponível' }

    if (simulado.status === 'ENCERRADO') return { indisponivel: true, motivo: 'Encerrado' }

    // A janela de disponibilidade depende do relógio no momento da exibição.
    // eslint-disable-next-line react-hooks/purity
    const agora = Date.now()

    if (simulado.dataInicio && new Date(simulado.dataInicio).getTime() > agora) {
      return { indisponivel: true, motivo: `Abre em ${formatarDataHora(simulado.dataInicio)}` }
    }

    if (simulado.dataFim && new Date(simulado.dataFim).getTime() < agora) {
      return { indisponivel: true, motivo: 'Prazo encerrado' }
    }

    return { indisponivel: false, motivo: undefined }
  }

  // Confirmado no Figma: a tabela de "Simulados realizados" tem só 3 colunas
  // (Título, Acertos, Tempo) — sem Disciplina nem Nota.
  const colunas: Coluna<SimuladoAlunoResponse>[] = [
    {
      key: 'titulo',
      cabecalho: 'Título',
      render: (tentativa) => porSimulado.get(tentativa.simuladoId)?.titulo ?? '—',
    },
    {
      key: 'acertos',
      cabecalho: 'Acertos',
      alinhamento: 'center',
      render: (tentativa) => {
        const simulado = porSimulado.get(tentativa.simuladoId)

        return typeof tentativa.quantidadeAcertos === 'number'
          ? `${tentativa.quantidadeAcertos}${
              simulado?.quantidadeQuestoes ? ` / ${simulado.quantidadeQuestoes}` : ''
            }`
          : '—'
      },
    },
    {
      key: 'tempo',
      cabecalho: 'Tempo',
      alinhamento: 'center',
      render: (tentativa) => formatarTempo(tentativa.tempoGasto),
    },
  ]

  const paginacaoRealizados = usePaginacao(realizados)

  if (erroAluno) {
    return (
      <Layout>
        <Header titulo="Reforço" />
        <ErroCarregamento titulo="Cadastro do aluno não encontrado" mensagem={erroAluno} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Reforço de aprendizagem"
        filtros={
          <CamposCabecalho>
            <CampoLargura>
              <Select<number>
                options={opcoesDisciplinas}
                value={disciplinaSelecionada}
                loading={requisicaoDisciplinas.loading}
                clearable
                placeholder="Todas as disciplinas"
                emptyText="Nenhuma disciplina com simulados"
                onChange={setDisciplinaSelecionada}
              />
            </CampoLargura>

            <Button size="large" onClick={() => setDisciplinaId(disciplinaSelecionada)}>
              Buscar
            </Button>
          </CamposCabecalho>
        }
      />

      <Tab<Aba>
        rotuloAcessivel="Filtrar simulados"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'aFazer', label: 'Para fazer', contador: aFazer.length },
          { value: 'realizados', label: 'Realizados', contador: realizados.length },
        ]}
      />

      {aba === 'aFazer' &&
        (requisicaoTentativas.loading || carregandoAluno ? (
          <Card>
            <Skeleton $altura="120px" $raio="8px" />
          </Card>
        ) : requisicaoTentativas.error ? (
          <Card>
            <ErroCarregamento
              mensagem={requisicaoTentativas.error}
              onRetry={requisicaoTentativas.reload}
            />
          </Card>
        ) : aFazer.length === 0 ? (
          <Card>
            <EstadoVazio
              titulo="Tudo em dia!"
              descricao="Você não tem simulados pendentes no momento."
              icon={<CheckCircle2 />}
            />
          </Card>
        ) : (
          // Confirmado no Figma: os cards de simulado ficam soltos direto no
          // fundo da página, não dentro de um Card "container".
          <Lista>
            {aFazer.map((tentativa) => {
              const simulado = porSimulado.get(tentativa.simuladoId)
              const situacao = disponibilidade(tentativa.simuladoId)

              return (
                <SimuladoIniciarCard
                  key={tentativa.id}
                  disciplina={
                    nomeDisciplina(simulado?.disciplinaId) ??
                    simulado?.titulo ??
                    `Simulado ${tentativa.simuladoId}`
                  }
                  quantidadeQuestoes={simulado?.quantidadeQuestoes}
                  indisponivel={situacao.indisponivel}
                  motivoIndisponivel={situacao.motivo}
                  onStart={() => navegar(`/aluno/simulado/${tentativa.id}`)}
                />
              )
            })}
          </Lista>
        ))}

      {aba === 'realizados' && (
        <DataTable
          descricao="Simulados realizados"
          columns={colunas}
          data={paginacaoRealizados.itensDaPagina}
          rowKey={(tentativa) => tentativa.id}
          loading={requisicaoTentativas.loading}
          error={requisicaoTentativas.error}
          onReload={requisicaoTentativas.reload}
          actions={(tentativa) => (
            <Button
              variant="subtle"
              size="small"
              icon={<ClipboardList />}
              onClick={() => navegar(`/aluno/simulado/${tentativa.id}`)}
            >
              Detalhar
            </Button>
          )}
          paginacao={{
            pagina: paginacaoRealizados.pagina,
            totalPaginas: paginacaoRealizados.totalPaginas,
            label: paginacaoRealizados.label,
            temAnterior: paginacaoRealizados.temAnterior,
            temProxima: paginacaoRealizados.temProxima,
            onPrevious: paginacaoRealizados.anterior,
            onNext: paginacaoRealizados.proxima,
          }}
          empty={{
            titulo: 'Nenhum simulado concluído ainda',
            descricao: 'Comece pelo primeiro simulado da aba "Para fazer".',
            icon: <Sparkles />,
          }}
        />
      )}
    </Layout>
  )
}
