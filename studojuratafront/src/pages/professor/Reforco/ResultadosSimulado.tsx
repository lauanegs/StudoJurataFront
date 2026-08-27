import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ClipboardList, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  alunos as servicoAlunos,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../../services/endpoints'
import { formatarPorcentagem, formatarTempo } from '../../../utils/format'
import type { SimuladoAlunoResponse } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

/* Confirmado no Figma: "Participação: X/Y" e "Média geral: Z%" em linhas
   separadas de texto simples — não cards de indicador. */
const Info = styled.div`
  display: flex;
  flex-direction: column;
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

    return {
      total: tentativas.length,
      concluidas: concluidas.length,
      mediaPercentual: concluidas.length && maxima ? (somaNotas / concluidas.length / maxima) * 100 : null,
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
      key: 'tempo',
      cabecalho: 'Tempo',
      alinhamento: 'center',
      render: (tentativa) => formatarTempo(tentativa.tempoGasto),
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
          <Info>
            <span>Participação: {resumo.concluidas}/{resumo.total}</span>
            <span>
              Média geral: {resumo.mediaPercentual !== null ? formatarPorcentagem(resumo.mediaPercentual) : '—'}
            </span>
          </Info>
        }
        voltarPara="/professor/reforco/simulados"
        rotuloVoltar="Voltar para simulados"
      />

      <Card semPadding>
        <DataTable
          descricao="Resultados por aluno"
          columns={colunas}
          data={tentativas}
          rowKey={(tentativa) => tentativa.id}
          loading={requisicaoTentativas.loading || requisicaoAlunos.loading}
          error={requisicaoTentativas.error}
          onReload={requisicaoTentativas.reload}
          empty={{
            titulo: 'Simulado ainda não lançado',
            descricao:
              'Nenhuma tentativa foi criada. Use "Lançar" na lista de simulados para distribuí-lo aos alunos.',
            icon: <Users />,
          }}
          actions={(tentativa) => (
            <Button
              variant="subtle"
              size="small"
              icon={<ClipboardList />}
              onClick={() => navegar(`/professor/reforco/simulados/${idSimulado}/resultados/${tentativa.id}`)}
            >
              Detalhar
            </Button>
          )}
        />
      </Card>
    </Layout>
  )
}
