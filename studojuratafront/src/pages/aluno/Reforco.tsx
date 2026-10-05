import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ClipboardList, Sparkles } from 'lucide-react'

import { Layout } from '../../components/layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { Header, CamposFiltro, CampoFiltro } from '../../components/ui/Header'
import { Select } from '../../components/ui/Select'
import { SimuladoIniciarCard } from '../../components/simulados/SimuladoIniciarCard'
import { Tab } from '../../components/ui/Tab'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useCursoAluno } from '../../hooks/useCursoAluno'
import { useAlunoLogado } from '../../hooks/usePerfilLogado'
import { usePaginacao } from '../../hooks/usePaginacao'
import { useRequisicao } from '../../hooks/useRequisicao'
import { disciplinas as servicoDisciplinas } from '../../services/curriculo'
import { simuladoAlunos, simulados as servicoSimulados } from '../../services/simulados'
import { disponibilidadeDoSimulado } from '../../utils/disponibilidadeSimulado'
import { formatarTempo } from '../../utils/format'
import type { SimuladoAlunoResponse } from '../../types/simulados'
import type { Coluna } from '../../components/ui/DataTable/types'
import { Stack } from '../../components/ui/Stack'


type Aba = 'aFazer' | 'realizados' | 'encerrados'

export default function AlunoReforco() {
  const navegar = useNavigate()
  const { alunoId, loading: carregandoAluno, error: erroAluno } = useAlunoLogado()
  const { turmaId } = useCursoAluno()

  const [aba, setAba] = useState<Aba>('aFazer')
  // O filtro só se aplica ao clicar em "Buscar"; a seleção do campo fica separada do aplicado.
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
    // Só o curso escolhido após o login.
    const lista = (requisicaoTentativas.data ?? []).filter(
      (tentativa) => porSimulado.get(tentativa.simuladoId)?.turmaId === turmaId,
    )
    if (!disciplinaId) return lista

    return lista.filter((tentativa) => porSimulado.get(tentativa.simuladoId)?.disciplinaId === disciplinaId)
  }, [requisicaoTentativas.data, disciplinaId, porSimulado, turmaId])

  const pendentes = filtradas.filter((tentativa) => tentativa.status !== 'CONCLUIDO')
  // Pendente cujo simulado já não abre (encerrado/prazo vencido) sai de "Para fazer".
  // eslint-disable-next-line react-hooks/purity
  const agora = Date.now()
  const encerrados = pendentes.filter(
    (tentativa) => disponibilidadeDoSimulado(porSimulado.get(tentativa.simuladoId), agora).encerrado,
  )
  const aFazer = pendentes.filter((tentativa) => !encerrados.includes(tentativa))
  const realizados = filtradas.filter((tentativa) => tentativa.status === 'CONCLUIDO')

  const opcoesDisciplinas = useMemo(() => {
    const ids = new Set(
      (requisicaoTentativas.data ?? [])
        .filter((tentativa) => porSimulado.get(tentativa.simuladoId)?.turmaId === turmaId)
        .map((tentativa) => porSimulado.get(tentativa.simuladoId)?.disciplinaId)
        .filter((id): id is number => Boolean(id)),
    )

    return (requisicaoDisciplinas.data ?? [])
      .filter((disciplina) => ids.has(disciplina.id))
      .map((disciplina) => ({ value: disciplina.id, label: disciplina.titulo ?? '—' }))
  }, [requisicaoTentativas.data, requisicaoDisciplinas.data, porSimulado, turmaId])

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
          <CamposFiltro>
            <CampoFiltro $largura="280px">
              <Select<number>
                options={opcoesDisciplinas}
                value={disciplinaSelecionada}
                loading={requisicaoDisciplinas.loading}
                clearable
                placeholder="Todas as disciplinas"
                emptyText="Nenhuma disciplina com simulados"
                onChange={setDisciplinaSelecionada}
              />
            </CampoFiltro>

            <Button size="large" onClick={() => setDisciplinaId(disciplinaSelecionada)}>
              Buscar
            </Button>
          </CamposFiltro>
        }
      />

      <Tab<Aba>
        rotuloAcessivel="Filtrar simulados"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'aFazer', label: 'Para fazer', contador: aFazer.length },
          { value: 'realizados', label: 'Realizados', contador: realizados.length },
          { value: 'encerrados', label: 'Encerrados', contador: encerrados.length },
        ]}
      />

      {(aba === 'aFazer' || aba === 'encerrados') &&
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
        ) : (aba === 'aFazer' ? aFazer : encerrados).length === 0 ? (
          <Card>
            <EstadoVazio
              titulo={aba === 'aFazer' ? 'Tudo em dia!' : 'Nenhum simulado encerrado'}
              descricao={
                aba === 'aFazer'
                  ? 'Você não tem simulados pendentes no momento.'
                  : 'Simulados que fecharam sem você fazer aparecem aqui.'
              }
              icon={<CheckCircle2 />}
            />
          </Card>
        ) : (
          <Stack gap="md">
            {(aba === 'aFazer' ? aFazer : encerrados).map((tentativa) => {
              const simulado = porSimulado.get(tentativa.simuladoId)
              const situacao = disponibilidadeDoSimulado(simulado)

              return (
                <SimuladoIniciarCard
                  key={tentativa.id}
                  disciplina={
                    nomeDisciplina(simulado?.disciplinaId) ??
                    simulado?.titulo ??
                    `Simulado ${tentativa.simuladoId}`
                  }
                  autor={simulado?.autor}
                  quantidadeQuestoes={simulado?.quantidadeQuestoes}
                  indisponivel={situacao.indisponivel}
                  motivoIndisponivel={situacao.motivo}
                  onStart={() => navegar(`/aluno/simulado/${tentativa.id}`)}
                />
              )
            })}
          </Stack>
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
