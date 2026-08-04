import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { CheckCircle2, Sparkles } from 'lucide-react'

import { Layout } from '../../components/layout'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { Header } from '../../components/ui/Header'
import { Select } from '../../components/ui/Select'
import { SimuladoIniciarCard } from '../../components/ui/SimuladoIniciarCard'
import { Tab } from '../../components/ui/Tab'
import { Tag } from '../../components/ui/Tag'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useAlunoLogado } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import {
  disciplinas as servicoDisciplinas,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../services/endpoints'
import { formatarDataHora, formatarNota, formatarTempo } from '../../utils/format'
import type { SimuladoAlunoResponse } from '../../types'
import type { Coluna } from '../../components/ui/DataTable/types'

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

type Aba = 'aFazer' | 'realizados'

export default function AlunoReforco() {
  const navegar = useNavigate()
  const { alunoId, loading: carregandoAluno, error: erroAluno } = useAlunoLogado()

  const [aba, setAba] = useState<Aba>('aFazer')
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

  const colunas: Coluna<SimuladoAlunoResponse>[] = [
    {
      key: 'titulo',
      cabecalho: 'Simulado',
      render: (tentativa) => porSimulado.get(tentativa.simuladoId)?.titulo ?? '—',
    },
    {
      key: 'disciplina',
      cabecalho: 'Disciplina',
      ocultarEmTelaPequena: true,
      render: (tentativa) => {
        const nome = nomeDisciplina(porSimulado.get(tentativa.simuladoId)?.disciplinaId)
        return nome ? <Tag variant="purple">{nome}</Tag> : '—'
      },
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
      key: 'nota',
      cabecalho: 'Nota',
      alinhamento: 'center',
      ordenavel: true,
      valorOrdenacao: (tentativa) => tentativa.nota ?? -1,
      render: (tentativa) => {
        if (typeof tentativa.nota !== 'number') return '—'

        const maxima = porSimulado.get(tentativa.simuladoId)?.notaMaxima ?? 10
        const percentual = maxima ? (tentativa.nota / maxima) * 100 : 0

        return (
          <Tag variant={percentual >= 70 ? 'success' : percentual >= 50 ? 'warning' : 'error'}>
            {formatarNota(tentativa.nota)}
          </Tag>
        )
      },
    },
    {
      key: 'tempo',
      cabecalho: 'Tempo',
      alinhamento: 'center',
      ocultarEmTelaPequena: true,
      render: (tentativa) => formatarTempo(tentativa.tempoGasto),
    },
  ]

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
        subtitulo={
          !requisicaoTentativas.loading
            ? `${aFazer.length} simulado(s) para fazer · ${realizados.length} concluído(s)`
            : undefined
        }
        filtros={
          <Select<number>
            label="Disciplina"
            options={opcoesDisciplinas}
            value={disciplinaId}
            loading={requisicaoDisciplinas.loading}
            clearable
            placeholder="Todas as disciplinas"
            maxWidth="280px"
            emptyText="Nenhuma disciplina com simulados"
            onChange={setDisciplinaId}
          />
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

      {aba === 'aFazer' && (
        <Card>
          {requisicaoTentativas.loading || carregandoAluno ? (
            <Skeleton $altura="120px" $raio="8px" />
          ) : requisicaoTentativas.error ? (
            <ErroCarregamento
              mensagem={requisicaoTentativas.error}
              onRetry={requisicaoTentativas.reload}
            />
          ) : aFazer.length === 0 ? (
            <EstadoVazio
              titulo="Tudo em dia!"
              descricao="Você não tem simulados pendentes no momento."
              icon={<CheckCircle2 />}
            />
          ) : (
            <Lista>
              {aFazer.map((tentativa) => {
                const simulado = porSimulado.get(tentativa.simuladoId)
                const situacao = disponibilidade(tentativa.simuladoId)

                return (
                  <SimuladoIniciarCard
                    key={tentativa.id}
                    titulo={simulado?.titulo ?? `Simulado ${tentativa.simuladoId}`}
                    disciplina={nomeDisciplina(simulado?.disciplinaId)}
                    quantidadeQuestoes={simulado?.quantidadeQuestoes}
                    tempoLimite={simulado?.tempoLimite}
                    prazo={simulado?.dataFim ? formatarDataHora(simulado.dataFim) : undefined}
                    indisponivel={situacao.indisponivel}
                    motivoIndisponivel={situacao.motivo}
                    onStart={() => navegar(`/aluno/simulado/${tentativa.id}`)}
                  />
                )
              })}
            </Lista>
          )}
        </Card>
      )}

      {aba === 'realizados' && (
        <DataTable
          descricao="Simulados realizados"
          columns={colunas}
          data={realizados}
          rowKey={(tentativa) => tentativa.id}
          loading={requisicaoTentativas.loading}
          error={requisicaoTentativas.error}
          onReload={requisicaoTentativas.reload}
          onRowClick={(tentativa) => navegar(`/aluno/simulado/${tentativa.id}`)}
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
