import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ClipboardCheck, FileText, Plus, Sparkles, TrendingUp } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlertaDesempenhoCard } from '../../../components/ui/AlertaDesempenhoCard'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DesempenhoCard } from '../../../components/ui/DesempenhoCard'
import { Header } from '../../../components/ui/Header'
import { InfoCard } from '../../../components/ui/InfoCard'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  disciplinas as servicoDisciplinas,
  questoes as servicoQuestoes,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../../services/endpoints'
import { formatarPorcentagem } from '../../../utils/format'

const Indicadores = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

interface DesempenhoDisciplina {
  disciplinaId: number
  titulo: string
  percentual: number
  tentativas: number
}

/**
 * Painel do módulo de Reforço.
 *
 * Não há endpoint agregado no back, então o desempenho por disciplina é
 * calculado aqui: para cada simulado concluído, a nota do aluno é comparada
 * com a notaMaxima do simulado.
 */
export default function ReforcoDashboard() {
  const navegar = useNavigate()

  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoTentativas = useRequisicao(() => simuladoAlunos.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoPendentes = useRequisicao(() => servicoQuestoes.listarPendentes(), [])

  const desempenhos = useMemo<DesempenhoDisciplina[]>(() => {
    const simulados = requisicaoSimulados.data ?? []
    const tentativas = requisicaoTentativas.data ?? []
    const listaDisciplinas = requisicaoDisciplinas.data ?? []

    const porSimulado = new Map(simulados.map((simulado) => [simulado.id, simulado]))
    const acumulado = new Map<number, { soma: number; quantidade: number }>()

    tentativas
      .filter((tentativa) => tentativa.status === 'CONCLUIDO' && typeof tentativa.nota === 'number')
      .forEach((tentativa) => {
        const simulado = porSimulado.get(tentativa.simuladoId)
        if (!simulado?.disciplinaId) return

        const maxima = simulado.notaMaxima ?? 10
        if (!maxima) return

        const percentual = Math.min(100, ((tentativa.nota as number) / maxima) * 100)
        const atual = acumulado.get(simulado.disciplinaId) ?? { soma: 0, quantidade: 0 }

        acumulado.set(simulado.disciplinaId, {
          soma: atual.soma + percentual,
          quantidade: atual.quantidade + 1,
        })
      })

    return [...acumulado.entries()]
      .map(([disciplinaId, valores]) => ({
        disciplinaId,
        titulo:
          listaDisciplinas.find((disciplina) => disciplina.id === disciplinaId)?.titulo ??
          `Disciplina ${disciplinaId}`,
        percentual: valores.soma / valores.quantidade,
        tentativas: valores.quantidade,
      }))
      .sort((a, b) => a.percentual - b.percentual)
  }, [requisicaoSimulados.data, requisicaoTentativas.data, requisicaoDisciplinas.data])

  const mediaGeral = useMemo(() => {
    if (desempenhos.length === 0) return null
    return desempenhos.reduce((total, item) => total + item.percentual, 0) / desempenhos.length
  }, [desempenhos])

  const criticos = desempenhos.filter((item) => item.percentual < 50)
  const pendentes = requisicaoPendentes.data?.length ?? 0

  const publicados = (requisicaoSimulados.data ?? []).filter(
    (simulado) => simulado.status === 'PUBLICADO',
  ).length

  const loading =
    requisicaoSimulados.loading ||
    requisicaoTentativas.loading ||
    requisicaoDisciplinas.loading

  const error = requisicaoSimulados.error ?? requisicaoTentativas.error

  return (
    <Layout>
      <Header
        titulo="Módulo de Reforço"
        subtitulo={
          mediaGeral !== null
            ? `Aproveitamento médio de ${formatarPorcentagem(mediaGeral)} nos simulados concluídos`
            : undefined
        }
        actions={
          <>
            <Button
              variant="secondary"
              icon={<ClipboardCheck />}
              onClick={() => navegar('/professor/reforco/questoes')}
            >
              Questões pendentes{pendentes > 0 ? ` (${pendentes})` : ''}
            </Button>
            <Button
              variant="secondary"
              icon={<FileText />}
              onClick={() => navegar('/professor/reforco/simulados')}
            >
              Ver simulados
            </Button>
            <Button icon={<Plus />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
              Novo simulado
            </Button>
          </>
        }
      />

      {criticos.length > 0 && (
        <AlertaDesempenhoCard
          titulo="Desempenho abaixo de 50%"
          descricao={`${criticos.map((item) => item.titulo).join(', ')} ${
            criticos.length === 1 ? 'está' : 'estão'
          } com aproveitamento crítico. Considere lançar um simulado de reforço.`}
          acao={
            <Button
              size="small"
              icon={<Sparkles />}
              onClick={() => navegar('/professor/reforco/simulados/novo')}
            >
              Criar reforço
            </Button>
          }
        />
      )}

      {loading ? (
        <Indicadores>
          <Skeleton $altura="80px" $raio="16px" />
          <Skeleton $altura="80px" $raio="16px" />
          <Skeleton $altura="80px" $raio="16px" />
        </Indicadores>
      ) : (
        <Indicadores>
          <InfoCard
            value={requisicaoSimulados.data?.length ?? 0}
            label="simulados criados"
            icon={<FileText />}
            tone="purple"
          />
          <InfoCard value={publicados} label="simulados publicados" icon={<TrendingUp />} tone="blue" />
          <InfoCard
            value={pendentes}
            label="questões aguardando revisão"
            icon={<ClipboardCheck />}
            tone={pendentes > 0 ? 'warning' : 'success'}
          />
        </Indicadores>
      )}

      <Card
        titulo="Desempenho por disciplina"
        actions={
          <span style={{ fontSize: '12px', color: '#737373' }}>
            Calculado sobre a nota das tentativas concluídas ÷ nota máxima do simulado.
          </span>
        }
      >
        {loading ? (
          <Skeleton $altura="140px" $raio="8px" />
        ) : error ? (
          <ErroCarregamento mensagem={error} onRetry={requisicaoSimulados.reload} />
        ) : desempenhos.length === 0 ? (
          <EstadoVazio
            titulo="Ainda não há simulados concluídos"
            descricao="Assim que os alunos finalizarem os primeiros simulados, o desempenho por disciplina aparece aqui."
            icon={<TrendingUp />}
            acao={
              <Button icon={<Plus />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
                Criar simulado
              </Button>
            }
          />
        ) : (
          <Lista>
            {desempenhos.map((item) => (
              <DesempenhoCard
                key={item.disciplinaId}
                titulo={item.titulo}
                descricao={`${item.tentativas} tentativa(s) concluída(s)`}
                porcentagem={item.percentual}
              />
            ))}
          </Lista>
        )}
      </Card>
    </Layout>
  )
}
