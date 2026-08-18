import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Target } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlternativaCard } from '../../../components/ui/AlternativaCard'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
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
import { formatarTempo, letraAlternativa } from '../../../utils/format'
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

/* Confirmado no Figma: "Aluno(a): X", "Acertos: X/Y", "Tempo: HH:MM:SS" em
   linhas separadas de texto simples no header — não tags. */
const Info = styled.div`
  display: flex;
  flex-direction: column;
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

  return (
    <Layout>
      <Header
        titulo={simulado?.titulo ?? 'Correção da tentativa'}
        subtitulo={
          tentativa && (
            <Info>
              <span>Aluno(a): {nomeAluno}</span>
              <span>
                Acertos: {typeof tentativa.quantidadeAcertos === 'number' ? tentativa.quantidadeAcertos : '—'}
                {simulado?.quantidadeQuestoes ? ` / ${simulado.quantidadeQuestoes}` : ''}
              </span>
              <span>Tempo: {formatarTempo(tentativa.tempoGasto)}</span>
            </Info>
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
              <strong style={{ display: 'block', marginBottom: '8px' }}>Questão {indice + 1}</strong>

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
