import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { CheckCircle2, Clock, Percent, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { InfoCard } from '../../../components/ui/InfoCard'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  alunos as servicoAlunos,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../../services/endpoints'
import { formatarNota, formatarPorcentagem, formatarTempo } from '../../../utils/format'
import {
  ROTULO_STATUS_SIMULADO,
  ROTULO_STATUS_SIMULADO_ALUNO,
  STATUS_SIMULADO_VARIANT,
  STATUS_SIMULADO_ALUNO_VARIANT,
} from '../../../utils/labels'
import type { SimuladoAlunoResponse } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

const Indicadores = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

export default function ResultadosSimulado() {
  const { simuladoId } = useParams()
  const navegar = useNavigate()

  const idSimulado = Number(simuladoId)

  const requisicaoSimulado = useRequisicao(() => servicoSimulados.buscar(idSimulado), [idSimulado])
  const requisicaoTentativas = useRequisicao(
    () => simuladoAlunos.listarPorSimulado(idSimulado),
    [idSimulado],
  )
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])

  const nomeAluno = (alunoId: number) =>
    (requisicaoAlunos.data ?? []).find((aluno) => aluno.id === alunoId)?.pessoa?.nome ??
    `Aluno ${alunoId}`

  const simulado = requisicaoSimulado.data
  const tentativas = useMemo(
    () => requisicaoTentativas.data ?? [],
    [requisicaoTentativas.data],
  )

  const resumo = useMemo(() => {
    const concluidas = tentativas.filter((tentativa) => tentativa.status === 'CONCLUIDO')
    const maxima = simulado?.notaMaxima ?? 10

    const somaNotas = concluidas.reduce((total, tentativa) => total + (tentativa.nota ?? 0), 0)
    const somaTempos = concluidas.reduce((total, tentativa) => total + (tentativa.tempoGasto ?? 0), 0)

    return {
      total: tentativas.length,
      concluidas: concluidas.length,
      mediaNota: concluidas.length ? somaNotas / concluidas.length : null,
      mediaPercentual: concluidas.length && maxima ? (somaNotas / concluidas.length / maxima) * 100 : null,
      tempoMedio: concluidas.length ? somaTempos / concluidas.length : null,
    }
  }, [tentativas, simulado])

  const colunas: Coluna<SimuladoAlunoResponse>[] = [
    {
      key: 'aluno',
      cabecalho: 'Aluno',
      ordenavel: true,
      valorOrdenacao: (tentativa) => nomeAluno(tentativa.alunoId),
      render: (tentativa) => nomeAluno(tentativa.alunoId),
    },
    {
      key: 'status',
      cabecalho: 'Situação',
      render: (tentativa) =>
        tentativa.status ? (
          <Tag variant={STATUS_SIMULADO_ALUNO_VARIANT[tentativa.status]} ponto>
            {ROTULO_STATUS_SIMULADO_ALUNO[tentativa.status]}
          </Tag>
        ) : (
          '—'
        ),
    },
    {
      key: 'acertos',
      cabecalho: 'Acertos',
      alinhamento: 'center',
      ordenavel: true,
      valorOrdenacao: (tentativa) => tentativa.quantidadeAcertos ?? -1,
      render: (tentativa) =>
        typeof tentativa.quantidadeAcertos === 'number'
          ? `${tentativa.quantidadeAcertos}${
              simulado?.quantidadeQuestoes ? ` / ${simulado.quantidadeQuestoes}` : ''
            }`
          : '—',
    },
    {
      key: 'nota',
      cabecalho: 'Nota',
      alinhamento: 'center',
      ordenavel: true,
      valorOrdenacao: (tentativa) => tentativa.nota ?? -1,
      render: (tentativa) => {
        if (typeof tentativa.nota !== 'number') return '—'

        const maxima = simulado?.notaMaxima ?? 10
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
      render: (tentativa) => (
        <>
          {formatarTempo(tentativa.tempoGasto)}
          {tentativa.finalizadoPorTempo && (
            <Tag variant="warning" size="small">
              por tempo
            </Tag>
          )}
        </>
      ),
    },
  ]

  if (requisicaoSimulado.error) {
    return (
      <Layout>
        <Header titulo="Resultados" voltarPara="/professor/reforco/simulados" />
        <ErroCarregamento
          mensagem={requisicaoSimulado.error}
          onRetry={requisicaoSimulado.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={simulado?.titulo ?? 'Resultados do simulado'}
        subtitulo={
          simulado && (
            <>
              {simulado.status && (
                <Tag variant={STATUS_SIMULADO_VARIANT[simulado.status]} ponto>
                  {ROTULO_STATUS_SIMULADO[simulado.status]}
                </Tag>
              )}
              {simulado.quantidadeQuestoes ? (
                <span>{simulado.quantidadeQuestoes} questões</span>
              ) : null}
              {simulado.tempoLimite ? <span>· {simulado.tempoLimite} min</span> : null}
            </>
          )
        }
        voltarPara="/professor/reforco/simulados"
        rotuloVoltar="Voltar para simulados"
      />

      {requisicaoTentativas.loading ? (
        <Indicadores>
          <Skeleton $altura="80px" $raio="16px" />
          <Skeleton $altura="80px" $raio="16px" />
          <Skeleton $altura="80px" $raio="16px" />
          <Skeleton $altura="80px" $raio="16px" />
        </Indicadores>
      ) : (
        <Indicadores>
          <InfoCard
            value={`${resumo.concluidas}/${resumo.total}`}
            label="tentativas concluídas"
            icon={<CheckCircle2 />}
            tone="success"
          />
          <InfoCard value={resumo.total} label="alunos com o simulado" icon={<Users />} tone="purple" />
          <InfoCard
            value={resumo.mediaNota !== null ? formatarNota(resumo.mediaNota) : '—'}
            label="nota média"
            icon={<Percent />}
            tone="blue"
          />
          <InfoCard
            value={resumo.tempoMedio !== null ? formatarTempo(resumo.tempoMedio) : '—'}
            label="tempo médio"
            icon={<Clock />}
            tone="warning"
          />
        </Indicadores>
      )}

      <Card
        semPadding
        titulo="Desempenho por aluno"
        actions={
          resumo.mediaPercentual !== null ? (
            <Tag
              variant={
                resumo.mediaPercentual >= 70
                  ? 'success'
                  : resumo.mediaPercentual >= 50
                    ? 'warning'
                    : 'error'
              }
            >
              Aproveitamento médio {formatarPorcentagem(resumo.mediaPercentual)}
            </Tag>
          ) : undefined
        }
      >
        <DataTable
          descricao="Resultados por aluno"
          columns={colunas}
          data={tentativas}
          rowKey={(tentativa) => tentativa.id}
          loading={requisicaoTentativas.loading || requisicaoAlunos.loading}
          error={requisicaoTentativas.error}
          onReload={requisicaoTentativas.reload}
          onRowClick={(tentativa) =>
            navegar(`/professor/reforco/simulados/${idSimulado}/resultados/${tentativa.id}`)
          }
          empty={{
            titulo: 'Simulado ainda não lançado',
            descricao:
              'Nenhuma tentativa foi criada. Use "Lançar" na lista de simulados para distribuí-lo aos alunos.',
            icon: <Users />,
          }}
        />
      </Card>
    </Layout>
  )
}
