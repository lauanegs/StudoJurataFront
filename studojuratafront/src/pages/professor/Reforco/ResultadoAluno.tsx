import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Clock, Target } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlternativaCard } from '../../../components/ui/AlternativaCard'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  alternativas as servicoAlternativas,
  alunos as servicoAlunos,
  questaoAlunos,
  questoes as servicoQuestoes,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../../services/endpoints'
import { formatarNota, formatarTempo, letraAlternativa } from '../../../utils/format'
import type { AlternativaResponse } from '../../../types'

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Alternativas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const Enunciado = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`

export default function ResultadoAluno() {
  const { simuladoId, simuladoAlunoId } = useParams()

  const idSimulado = Number(simuladoId)
  const idTentativa = Number(simuladoAlunoId)

  const requisicaoSimulado = useRequisicao(() => servicoSimulados.buscar(idSimulado), [idSimulado])
  const requisicaoTentativa = useRequisicao(() => simuladoAlunos.buscar(idTentativa), [idTentativa])
  const requisicaoRespostas = useRequisicao(
    () => questaoAlunos.listarPorSimuladoAluno(idTentativa),
    [idTentativa],
  )
  const requisicaoQuestoes = useRequisicao(() => servicoQuestoes.listar(), [])
  const requisicaoAlternativas = useRequisicao(() => servicoAlternativas.listar(), [])
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])

  const tentativa = requisicaoTentativa.data
  const simulado = requisicaoSimulado.data

  const nomeAluno = useMemo(
    () =>
      (requisicaoAlunos.data ?? []).find((aluno) => aluno.id === tentativa?.alunoId)?.pessoa?.nome ??
      (tentativa ? `Aluno ${tentativa.alunoId}` : ''),
    [requisicaoAlunos.data, tentativa],
  )

  const correcao = useMemo(() => {
    const respostas = requisicaoRespostas.data ?? []
    const questoes = requisicaoQuestoes.data ?? []
    const todasAlternativas = requisicaoAlternativas.data ?? []

    return respostas.map((resposta) => {
      const questao = questoes.find((item) => item.id === resposta.questaoId)

      const alternativasDaQuestao = todasAlternativas
        .filter((alternativa) => alternativa.questaoId === resposta.questaoId)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

      return {
        respostaId: resposta.id,
        enunciado: questao?.enunciado ?? 'Questão não encontrada',
        acertou: Boolean(resposta.acertou),
        emBranco: resposta.alternativaId === null || resposta.alternativaId === undefined,
        tempoResposta: resposta.tempoResposta,
        alternativas: alternativasDaQuestao,
        alternativaMarcada: resposta.alternativaId ?? null,
      }
    })
  }, [requisicaoRespostas.data, requisicaoQuestoes.data, requisicaoAlternativas.data])

  function letraDe(alternativa: AlternativaResponse, lista: AlternativaResponse[]) {
    const posicao = lista.findIndex((item) => item.id === alternativa.id)
    return letraAlternativa(posicao < 0 ? 0 : posicao)
  }

  if (requisicaoTentativa.error) {
    return (
      <Layout>
        <Header
          titulo="Correção"
          voltarPara={`/professor/reforco/simulados/${idSimulado}/resultados`}
        />
        <ErroCarregamento
          mensagem={requisicaoTentativa.error}
          onRetry={requisicaoTentativa.reload}
        />
      </Layout>
    )
  }

  const maxima = simulado?.notaMaxima ?? 10
  const percentual = tentativa?.nota !== undefined && maxima ? (tentativa.nota / maxima) * 100 : null

  return (
    <Layout>
      <Header
        titulo={nomeAluno || 'Correção da tentativa'}
        subtitulo={
          tentativa && (
            <>
              <strong>{simulado?.titulo}</strong>

              {typeof tentativa.nota === 'number' && (
                <Tag
                  variant={
                    percentual !== null && percentual >= 70
                      ? 'success'
                      : percentual !== null && percentual >= 50
                        ? 'warning'
                        : 'error'
                  }
                  icon={<Target />}
                >
                  Nota {formatarNota(tentativa.nota)} de {formatarNota(maxima)}
                </Tag>
              )}

              {typeof tentativa.quantidadeAcertos === 'number' && (
                <Tag variant="neutral">{tentativa.quantidadeAcertos} acerto(s)</Tag>
              )}

              <Tag variant="neutral" icon={<Clock />}>
                {formatarTempo(tentativa.tempoGasto)}
              </Tag>

              {tentativa.finalizadoPorTempo && (
                <Tag variant="warning">Finalizado por esgotamento do tempo</Tag>
              )}
            </>
          )
        }
        voltarPara={`/professor/reforco/simulados/${idSimulado}/resultados`}
        rotuloVoltar="Voltar para os resultados"
      />

      {requisicaoRespostas.loading ? (
        <SkeletonCartao />
      ) : correcao.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma resposta registrada"
          descricao="Este aluno ainda não finalizou a tentativa."
          icon={<Target />}
        />
      ) : (
        <Lista>
          {correcao.map((item, indice) => (
            <Card key={item.respostaId}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '8px',
                }}
              >
                <strong>Questão {indice + 1}</strong>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {item.emBranco ? (
                    <Tag variant="neutral">Em branco</Tag>
                  ) : item.acertou ? (
                    <Tag variant="success" ponto>
                      Acertou
                    </Tag>
                  ) : (
                    <Tag variant="error" ponto>
                      Errou
                    </Tag>
                  )}

                  {item.tempoResposta ? (
                    <Tag variant="neutral" icon={<Clock />}>
                      {formatarTempo(item.tempoResposta)}
                    </Tag>
                  ) : null}
                </div>
              </div>

              <Enunciado>{item.enunciado}</Enunciado>

              <Alternativas>
                {item.alternativas.map((alternativa) => {
                  const marcada = alternativa.id === item.alternativaMarcada

                  return (
                    <AlternativaCard
                      key={alternativa.id}
                      letra={letraDe(alternativa, item.alternativas)}
                      texto={alternativa.texto}
                      status={
                        alternativa.correta ? 'correct' : marcada ? 'incorrect' : 'neutral'
                      }
                      legenda={
                        alternativa.correta && marcada
                          ? 'Resposta correta (marcada pelo aluno)'
                          : undefined
                      }
                    />
                  )
                })}
              </Alternativas>
            </Card>
          ))}
        </Lista>
      )}
    </Layout>
  )
}
