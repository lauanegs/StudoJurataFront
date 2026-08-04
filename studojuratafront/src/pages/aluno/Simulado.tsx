import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Coins, Flag, Target } from 'lucide-react'

import { AlternativaButton } from '../../components/ui/AlternativaButton'
import { AlternativaCard } from '../../components/ui/AlternativaCard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EnunciadoSimuladoCard } from '../../components/ui/EnunciadoSimuladoCard'
import {
  ProgressoSimuladoCard,
  type QuestionProgressStatus,
} from '../../components/ui/ProgressoSimuladoCard'
import { SimuladoHeader } from '../../components/ui/SimuladoHeader'
import { Tag } from '../../components/ui/Tag'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../components/feedback/Skeleton'
import { useConfirm } from '../../contexts/confirmContexto'
import { useToast } from '../../contexts/toastContexto'
import { useAuth } from '../../hooks/useAuth'
import { useAlunoLogado, useSkinEquipadaDoAluno } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import { ApiError } from '../../services/api'
import {
  alternativas as servicoAlternativas,
  questaoAlunos,
  questoes as servicoQuestoes,
  simuladoAlunos,
  simuladoQuestoes,
  simulados as servicoSimulados,
} from '../../services/endpoints'
import { formatarNota, formatarTempo, letraAlternativa, nomeCurto } from '../../utils/format'
import type { AlternativaResponse } from '../../types'

const Tela = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  max-width: 820px;
  min-height: 100vh;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
`

const Alternativas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Rodape = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const Parabens = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`

const Mascote = styled.img`
  width: 96px;
  object-fit: contain;
`

const Etiquetas = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const RevisaoLista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

interface QuestaoDaProva {
  questaoId: number
  enunciado: string
  alternativas: AlternativaResponse[]
}

/**
 * Execução do simulado pelo aluno.
 *
 * O back só calcula acertos e nota no POST /simulado-aluno/{id}/finalizar —
 * por isso a tela não revela se a resposta está certa durante a prova. A
 * correção completa aparece depois de finalizar, na mesma tela.
 *
 * Questões não respondidas são enviadas com `alternativaId: null`; o back as
 * trata como em branco (contam como error, mas não impedem a finalização).
 */
export default function Simulado() {
  const { simuladoAlunoId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { usuario } = useAuth()
  const { alunoId } = useAlunoLogado()
  const { imagemSkin } = useSkinEquipadaDoAluno(alunoId)

  const idTentativa = Number(simuladoAlunoId)

  const [indiceAtual, setIndiceAtual] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, number | null>>({})
  const [temposPorQuestao, setTemposPorQuestao] = useState<Record<number, number>>({})
  const [segundos, setSegundos] = useState(0)
  const [finalizando, setFinalizando] = useState(false)

  // Marca quando o aluno entrou na questão atual. Começa em 0 e é ajustado no
  // primeiro efeito, para não ler o relógio durante a renderização.
  const inicioQuestaoRef = useRef(0)

  const requisicaoTentativa = useRequisicao(() => simuladoAlunos.buscar(idTentativa), [idTentativa])

  const simuladoId = requisicaoTentativa.data?.simuladoId ?? null
  const concluido = requisicaoTentativa.data?.status === 'CONCLUIDO'

  const requisicaoSimulado = useRequisicao(
    () => servicoSimulados.buscar(simuladoId as number),
    [simuladoId],
    { ativo: Boolean(simuladoId) },
  )
  const requisicaoVinculos = useRequisicao(() => simuladoQuestoes.listar(), [])
  const requisicaoQuestoes = useRequisicao(() => servicoQuestoes.listar(), [])
  const requisicaoAlternativas = useRequisicao(() => servicoAlternativas.listar(), [])
  const requisicaoRespostas = useRequisicao(
    () => questaoAlunos.listarPorSimuladoAluno(idTentativa),
    [idTentativa],
    { ativo: concluido },
  )

  const simulado = requisicaoSimulado.data

  const questoes = useMemo<QuestaoDaProva[]>(() => {
    if (!simuladoId) return []

    const vinculos = (requisicaoVinculos.data ?? [])
      .filter((vinculo) => vinculo.simuladoId === simuladoId && vinculo.status !== 'REMOVIDA')
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

    const todasQuestoes = requisicaoQuestoes.data ?? []
    const todasAlternativas = requisicaoAlternativas.data ?? []

    return vinculos.flatMap((vinculo) => {
      const questao = todasQuestoes.find((item) => item.id === vinculo.questaoId)
      if (!questao) return []

      return [
        {
          questaoId: questao.id,
          enunciado: questao.enunciado,
          alternativas: todasAlternativas
            .filter((alternativa) => alternativa.questaoId === questao.id)
            .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
        },
      ]
    })
  }, [simuladoId, requisicaoVinculos.data, requisicaoQuestoes.data, requisicaoAlternativas.data])

  const tempoLimiteSegundos = simulado?.tempoLimite ? simulado.tempoLimite * 60 : null
  const restante = tempoLimiteSegundos !== null ? Math.max(0, tempoLimiteSegundos - segundos) : null

  const finalizar = useCallback(
    async (porTempo: boolean) => {
      if (finalizando) return

      setFinalizando(true)

      try {
        await simuladoAlunos.finalizar(idTentativa, {
          respostas: questoes.map((questao) => ({
            questaoId: questao.questaoId,
            alternativaId: respostas[questao.questaoId] ?? null,
            tempoResposta: temposPorQuestao[questao.questaoId],
          })),
          tempoGastoTotal: segundos,
          finalizadoPorTempo: porTempo,
        })

        toast.success(
          porTempo ? 'Tempo esgotado' : 'Simulado finalizado',
          'Confira sua correção abaixo.',
        )

        await Promise.all([requisicaoTentativa.reload(), requisicaoRespostas.reload()])
      } catch (erroFinalizar) {
        toast.error(
          'Não foi possível finalizar',
          erroFinalizar instanceof ApiError ? erroFinalizar.message : undefined,
        )
      } finally {
        setFinalizando(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [finalizando, idTentativa, questoes, respostas, temposPorQuestao, segundos],
  )

  useEffect(() => {
    if (concluido || requisicaoTentativa.loading) return

    if (inicioQuestaoRef.current === 0) inicioQuestaoRef.current = Date.now()

    const intervalo = setInterval(() => setSegundos((atual) => atual + 1), 1000)
    return () => clearInterval(intervalo)
  }, [concluido, requisicaoTentativa.loading])

  useEffect(() => {
    if (concluido || restante === null || restante > 0 || finalizando) return

    // A prova precisa ser encerrada mesmo sem ação do aluno — este é o único
    // caminho possível para isso.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void finalizar(true)
  }, [restante, concluido, finalizando, finalizar])

  useEffect(() => {
    if (concluido) return

    function onExit(evento: BeforeUnloadEvent) {
      evento.preventDefault()
      evento.returnValue = ''
    }

    window.addEventListener('beforeunload', onExit)
    return () => window.removeEventListener('beforeunload', onExit)
  }, [concluido])

  const questaoAtual = questoes[indiceAtual]

  function registrarTempoDaQuestao() {
    if (!questaoAtual) return

    const gasto = Math.round((Date.now() - inicioQuestaoRef.current) / 1000)

    setTemposPorQuestao((atuais) => ({
      ...atuais,
      [questaoAtual.questaoId]: (atuais[questaoAtual.questaoId] ?? 0) + gasto,
    }))

    inicioQuestaoRef.current = Date.now()
  }

  function irPara(indice: number) {
    if (indice < 0 || indice >= questoes.length) return

    registrarTempoDaQuestao()
    setIndiceAtual(indice)
  }

  async function confirmarFinalizacao() {
    registrarTempoDaQuestao()

    const semResposta = questoes.filter((questao) => !respostas[questao.questaoId]).length

    const confirmado = await confirmar({
      titulo: 'Finalizar o simulado?',
      descricao:
        semResposta > 0
          ? `Você deixou ${semResposta} questão(ões) em branco — elas contam como error. Deseja finalizar mesmo assim?`
          : 'Depois de finalizar não é possível alterar as respostas.',
      rotuloConfirmar: 'Finalizar',
      tone: semResposta > 0 ? 'danger' : 'default',
    })

    if (confirmado) await finalizar(false)
  }

  const statusProgresso = useMemo<QuestionProgressStatus[]>(
    () =>
      questoes.map((questao, indice) => {
        if (indice === indiceAtual) return 'current'
        return respostas[questao.questaoId] ? 'answered' : 'pending'
      }),
    [questoes, indiceAtual, respostas],
  )

  const loading =
    requisicaoTentativa.loading ||
    requisicaoSimulado.loading ||
    requisicaoVinculos.loading ||
    requisicaoQuestoes.loading ||
    requisicaoAlternativas.loading

  if (requisicaoTentativa.error) {
    return (
      <Tela>
        <ErroCarregamento
          mensagem={requisicaoTentativa.error}
          onRetry={requisicaoTentativa.reload}
        />
        <Button variant="secondary" onClick={() => navegar('/aluno/reforco')}>
          Voltar para o reforço
        </Button>
      </Tela>
    )
  }

  if (loading) {
    return (
      <Tela>
        <SkeletonCartao />
        <SkeletonCartao />
      </Tela>
    )
  }

  if (concluido) {
    const tentativa = requisicaoTentativa.data
    const maxima = simulado?.notaMaxima ?? 10
    const acertos = tentativa?.quantidadeAcertos ?? 0
    const erradas = questoes.length - acertos

    const respostasDoAluno = new Map(
      (requisicaoRespostas.data ?? []).map((resposta) => [resposta.questaoId, resposta]),
    )

    return (
      <Tela>
        <SimuladoHeader
          titulo={simulado?.titulo ?? 'Simulado'}
          segundos={tentativa?.tempoGasto ?? 0}
          onExit={() => navegar('/aluno/reforco')}
          rotuloSair="Voltar"
        />

        <Card>
          <Parabens>
            <Mascote src={imagemSkin} alt="" aria-hidden="true" />

            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>
                Parabéns, {nomeCurto(usuario?.nomePessoa)}!
              </strong>
              <span style={{ fontSize: '14px', color: '#656565' }}>
                Continue assim para desenvolver seus conhecimentos, você vai longe!
              </span>

              <Etiquetas>
                <Tag variant="success" icon={<CheckCircle2 />}>
                  {acertos} acerto(s)
                </Tag>
                <Tag variant={erradas > 0 ? 'error' : 'neutral'}>{erradas} error(s)</Tag>
                <Tag variant="neutral" icon={<Clock />}>
                  {formatarTempo(tentativa?.tempoGasto)}
                </Tag>
                {typeof tentativa?.nota === 'number' && (
                  <Tag variant="purple" icon={<Target />}>
                    Nota {formatarNota(tentativa.nota)} de {formatarNota(maxima)}
                  </Tag>
                )}
                {tentativa?.finalizadoPorTempo && (
                  <Tag variant="warning">Finalizado por tempo</Tag>
                )}
              </Etiquetas>
            </div>

            <Tag variant="warning" icon={<Coins />}>
              Moedas creditadas no seu perfil
            </Tag>
          </Parabens>
        </Card>

        <strong style={{ color: '#202020' }}>Revise as questões</strong>

        <RevisaoLista>
          {questoes.map((questao, indice) => {
            const resposta = respostasDoAluno.get(questao.questaoId)

            return (
              <Card key={questao.questaoId}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <strong>Questão {indice + 1}</strong>

                  {!resposta || resposta.alternativaId === null ? (
                    <Tag variant="neutral">Em branco</Tag>
                  ) : resposta.acertou ? (
                    <Tag variant="success" ponto>
                      Você acertou
                    </Tag>
                  ) : (
                    <Tag variant="error" ponto>
                      Você errou
                    </Tag>
                  )}
                </div>

                <p style={{ fontSize: '14px', color: '#656565', marginBottom: '12px' }}>
                  {questao.enunciado}
                </p>

                <Alternativas>
                  {questao.alternativas.map((alternativa, posicao) => {
                    const marcada = alternativa.id === resposta?.alternativaId

                    return (
                      <AlternativaCard
                        key={alternativa.id}
                        letra={letraAlternativa(posicao)}
                        texto={alternativa.texto}
                        status={alternativa.correta ? 'correct' : marcada ? 'incorrect' : 'neutral'}
                        legenda={
                          alternativa.correta && marcada
                            ? 'Resposta correta (você marcou)'
                            : alternativa.correta
                              ? 'Resposta correta'
                              : 'Sua resposta'
                        }
                      />
                    )
                  })}
                </Alternativas>
              </Card>
            )
          })}
        </RevisaoLista>

        <Button fullWidth size="large" onClick={() => navegar('/aluno/reforco')}>
          Voltar para o reforço
        </Button>
      </Tela>
    )
  }

  if (questoes.length === 0) {
    return (
      <Tela>
        <SimuladoHeader
          titulo={simulado?.titulo ?? 'Simulado'}
          segundos={segundos}
          onExit={() => navegar('/aluno/reforco')}
        />
        <ErroCarregamento
          titulo="Simulado sem questões"
          mensagem="Este simulado ainda não tem questões ativas. Avise seu professor."
        />
      </Tela>
    )
  }

  const respondidas = questoes.filter((questao) => respostas[questao.questaoId]).length

  return (
    <Tela>
      <SimuladoHeader
        titulo={simulado?.titulo ?? 'Simulado'}
        segundos={restante ?? segundos}
        regressivo={restante !== null}
        onExit={async () => {
          const confirmado = await confirmar({
            titulo: 'Sair do simulado?',
            descricao: 'Suas respostas não serão salvas e a tentativa continuará pendente.',
            rotuloConfirmar: 'Sair',
            tone: 'danger',
          })

          if (confirmado) navegar('/aluno/reforco')
        }}
      />

      <ProgressoSimuladoCard
        current={indiceAtual + 1}
        total={questoes.length}
        status={statusProgresso}
        onGoTo={irPara}
      />

      <EnunciadoSimuladoCard enunciado={questaoAtual.enunciado} mascoteSrc={imagemSkin} />

      <Alternativas>
        {questaoAtual.alternativas.map((alternativa, posicao) => (
          <AlternativaButton
            key={alternativa.id}
            letra={letraAlternativa(posicao)}
            texto={alternativa.texto}
            state={respostas[questaoAtual.questaoId] === alternativa.id ? 'selected' : 'default'}
            onSelect={() =>
              setRespostas((atuais) => ({
                ...atuais,
                [questaoAtual.questaoId]:
                  atuais[questaoAtual.questaoId] === alternativa.id ? null : alternativa.id,
              }))
            }
          />
        ))}
      </Alternativas>

      <Rodape>
        <Button
          variant="secondary"
          icon={<ArrowLeft />}
          disabled={indiceAtual === 0}
          onClick={() => irPara(indiceAtual - 1)}
        >
          Anterior
        </Button>

        <span style={{ fontSize: '13px', color: '#656565' }}>
          {respondidas} de {questoes.length} respondidas
        </span>

        {indiceAtual < questoes.length - 1 ? (
          <Button iconRight={<ArrowRight />} onClick={() => irPara(indiceAtual + 1)}>
            Próxima
          </Button>
        ) : (
          <Button
            variant="success"
            icon={<Flag />}
            loading={finalizando}
            onClick={confirmarFinalizacao}
          >
            Finalizar simulado
          </Button>
        )}
      </Rodape>

      {indiceAtual < questoes.length - 1 && (
        <Button
          variant="subtle"
          icon={<Flag />}
          loading={finalizando}
          onClick={confirmarFinalizacao}
        >
          Finalizar agora
        </Button>
      )}
    </Tela>
  )
}
