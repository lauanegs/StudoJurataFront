import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Clock, Target, User } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlternativaCard } from '../../../components/ui/AlternativaCard'
import { AlternativaVerdadeiroFalso } from '../../../components/ui/AlternativaVerdadeiroFalso'
import { Card } from '../../../components/ui/Card'
import { Header, SubtituloItem } from '../../../components/ui/Header'
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
import { formatarTempo, letraAlternativa } from '../../../utils/format'

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Alternativas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const QuestaoCabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

/* Sem herdar o preto padrão do texto do card — mesmo cinza usado no título
   da revisão do lado aluno (Simulado.tsx). */
const QuestaoTitulo = styled.strong`
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Enunciado = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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
      const ehVF = questao?.tipo === 'VERDADEIRO_FALSO'
      const marcadasVerdadeiras = new Set(resposta.alternativasVerdadeirasIds ?? [])

      const alternativasDaQuestao = todasAlternativas
        .filter((alternativa) => alternativa.questaoId === resposta.questaoId)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

      // `respondida` é novo — registros de simulados concluídos antes dessa
      // mudança não têm esse campo preenchido (null); mesmo fallback usado na
      // revisão do lado aluno (Simulado.tsx).
      const respondida =
        resposta.respondida ??
        (ehVF ? (resposta.alternativasVerdadeirasIds?.length ?? 0) > 0 : resposta.alternativaId != null)

      return {
        respostaId: resposta.id,
        enunciado: questao?.enunciado ?? 'Questão não encontrada',
        acertou: Boolean(resposta.acertou),
        respondida,
        ehVF,
        marcadasVerdadeiras,
        tempoResposta: resposta.tempoResposta,
        alternativas: alternativasDaQuestao,
        alternativaMarcada: resposta.alternativaId ?? null,
      }
    })
  }, [requisicaoRespostas.data, requisicaoQuestoes.data, requisicaoAlternativas.data])

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
            <>
              <SubtituloItem icon={<User />}>Aluno(a): {nomeAluno}</SubtituloItem>
              <SubtituloItem icon={<Target />}>
                Acertos: {typeof tentativa.quantidadeAcertos === 'number' ? tentativa.quantidadeAcertos : '—'}
                {simulado?.quantidadeQuestoes ? ` / ${simulado.quantidadeQuestoes}` : ''}
              </SubtituloItem>
              <SubtituloItem icon={<Clock />}>Tempo: {formatarTempo(tentativa.tempoGasto)}</SubtituloItem>
            </>
          )
        }
        voltarPara={`/professor/reforco/simulados/${idSimulado}/resultados`}
        rotuloVoltar="Resultados"
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
              <QuestaoCabecalho>
                <QuestaoTitulo>Questão {indice + 1}</QuestaoTitulo>

                {!item.respondida ? (
                  <Tag variant="neutral">Em branco</Tag>
                ) : item.acertou ? (
                  <Tag variant="success">
                    Acertou
                  </Tag>
                ) : (
                  <Tag variant="error">
                    Errou
                  </Tag>
                )}
              </QuestaoCabecalho>

              <Enunciado>{item.enunciado}</Enunciado>

              <Alternativas>
                {item.ehVF
                  ? item.alternativas.map((alternativa) => (
                      <AlternativaVerdadeiroFalso
                        key={alternativa.id}
                        texto={alternativa.texto}
                        valor={item.respondida ? item.marcadasVerdadeiras.has(alternativa.id) : null}
                        revelado
                        correta={alternativa.correta}
                        disabled
                      />
                    ))
                  : item.alternativas.map((alternativa, posicao) => {
                      const marcada = alternativa.id === item.alternativaMarcada

                      return (
                        <AlternativaCard
                          key={alternativa.id}
                          letra={letraAlternativa(posicao)}
                          texto={alternativa.texto}
                          status={alternativa.correta ? 'correct' : marcada ? 'incorrect' : 'neutral'}
                          legenda=""
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
