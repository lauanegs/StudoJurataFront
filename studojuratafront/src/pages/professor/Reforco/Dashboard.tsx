import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ClipboardCheck, FileText, Rocket, TrendingUp } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlertaDesempenhoCard } from '../../../components/ui/AlertaDesempenhoCard'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DesempenhoCard } from '../../../components/ui/DesempenhoCard'
import { Header } from '../../../components/ui/Header'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  disciplinas as servicoDisciplinas,
  questoes as servicoQuestoes,
  simuladoAlunos,
  simulados as servicoSimulados,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

/* Confirmado no Figma: "Turma: X" e "Disciplina: Y" em linhas separadas, não
   uma string só ("X · Y"). */
const InfoSimulado = styled.div`
  display: flex;
  flex-direction: column;
`

interface DesempenhoSimulado {
  simuladoId: number
  titulo: string
  turma: string
  disciplina: string
  percentual: number
  tentativas: number
}

/**
 * Painel do módulo de Reforço.
 *
 * Não há endpoint agregado no back, então o desempenho por simulado é
 * calculado aqui: para cada simulado com tentativas concluídas, a nota
 * média dos alunos é comparada com a notaMaxima do simulado (confirmado no
 * Figma: um card por simulado, não por disciplina).
 */
export default function ReforcoDashboard() {
  const navegar = useNavigate()

  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoTentativas = useRequisicao(() => simuladoAlunos.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoTurmas = useRequisicao(() => servicoTurmas.listar(), [])
  const requisicaoQuestoesPendentes = useRequisicao(() => servicoQuestoes.listarPendentes(), [])

  const desempenhos = useMemo<DesempenhoSimulado[]>(() => {
    const simulados = requisicaoSimulados.data ?? []
    const tentativas = requisicaoTentativas.data ?? []
    const listaDisciplinas = requisicaoDisciplinas.data ?? []
    const listaTurmas = requisicaoTurmas.data ?? []

    const acumulado = new Map<number, { soma: number; quantidade: number }>()

    tentativas
      .filter((tentativa) => tentativa.status === 'CONCLUIDO' && typeof tentativa.nota === 'number')
      .forEach((tentativa) => {
        const atual = acumulado.get(tentativa.simuladoId) ?? { soma: 0, quantidade: 0 }
        acumulado.set(tentativa.simuladoId, {
          soma: atual.soma + (tentativa.nota as number),
          quantidade: atual.quantidade + 1,
        })
      })

    return [...acumulado.entries()]
      .map(([simuladoId, valores]) => {
        const simulado = simulados.find((item) => item.id === simuladoId)
        const maxima = simulado?.notaMaxima || 10

        return {
          simuladoId,
          titulo: simulado?.titulo ?? `Simulado ${simuladoId}`,
          turma: listaTurmas.find((turma) => turma.id === simulado?.turmaId)?.titulo ?? 'Sem turma',
          disciplina:
            listaDisciplinas.find((disciplina) => disciplina.id === simulado?.disciplinaId)?.titulo ??
            'Sem disciplina',
          percentual: Math.min(100, (valores.soma / valores.quantidade / maxima) * 100),
          tentativas: valores.quantidade,
        }
      })
      .sort((a, b) => a.percentual - b.percentual)
  }, [requisicaoSimulados.data, requisicaoTentativas.data, requisicaoDisciplinas.data, requisicaoTurmas.data])

  const criticos = desempenhos.filter((item) => item.percentual < 50)
  const pendentes = requisicaoQuestoesPendentes.data?.length ?? 0

  const loading =
    requisicaoSimulados.loading ||
    requisicaoTentativas.loading ||
    requisicaoDisciplinas.loading ||
    requisicaoTurmas.loading

  const error = requisicaoSimulados.error ?? requisicaoTentativas.error

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
              icon={<FileText />}
              onClick={() => navegar('/professor/reforco/simulados')}
            >
              Ver simulados
            </Button>
            <Button size="large" icon={<Rocket />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
              Lançar simulado
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
            <Button size="small" icon={<Rocket />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
              Criar reforço
            </Button>
          }
        />
      )}

      <Card titulo="Desempenho">
        {loading ? (
          <Skeleton $altura="140px" $raio="8px" />
        ) : error ? (
          <ErroCarregamento mensagem={error} onRetry={requisicaoSimulados.reload} />
        ) : desempenhos.length === 0 ? (
          <EstadoVazio
            titulo="Ainda não há simulados concluídos"
            descricao="Assim que os alunos finalizarem os primeiros simulados, o desempenho aparece aqui."
            icon={<TrendingUp />}
            acao={
              <Button icon={<Rocket />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
                Lançar simulado
              </Button>
            }
          />
        ) : (
          <Lista>
            {desempenhos.map((item) => (
              <DesempenhoCard
                key={item.simuladoId}
                titulo={item.titulo}
                descricao={
                  <InfoSimulado>
                    <span>Turma: {item.turma}</span>
                    <span>Disciplina: {item.disciplina}</span>
                  </InfoSimulado>
                }
                porcentagem={item.percentual}
              />
            ))}
          </Lista>
        )}
      </Card>
    </Layout>
  )
}
