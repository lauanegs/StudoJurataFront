import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Flag } from 'lucide-react'

import { AlternativaButton } from '../../components/simulados/AlternativaButton'
import { AlternativaCard } from '../../components/simulados/AlternativaCard'
import { AlternativaVerdadeiroFalso } from '../../components/simulados/AlternativaVerdadeiroFalso'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EnunciadoSimuladoCard } from '../../components/simulados/EnunciadoSimuladoCard'
import { MoedaIcone } from '../../components/gamificacao/MoedaIcone'
import {
  ProgressoSimuladoCard,
  type QuestionProgressStatus,
} from '../../components/simulados/ProgressoSimuladoCard'
import { SimuladoHeader } from '../../components/simulados/SimuladoHeader'
import { Tag } from '../../components/ui/Tag'
import { Stack } from '../../components/ui/Stack'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../components/feedback/Skeleton'
import { useConfirm } from '../../contexts/confirmContexto'
import { useToast } from '../../contexts/toastContexto'
import { useAuth } from '../../hooks/useAuth'
import { useAlunoLogado, useSkinEquipadaDoAluno } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import { ApiError } from '../../services/api'
import {
  questaoAlunos,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../services/simulados'
import { formatarMoedas, formatarNota, formatarTempo, letraAlternativa, nomeCurto } from '../../utils/format'
import { resolverImagemSkin } from '../../utils/skins'
import { animacaoFlutuar } from '../../styles/animations'
import { theme } from '../../styles/theme'
import { corComOpacidade } from '../../utils/corComOpacidade'
import type { AlternativaResponse, TipoQuestao } from '../../types/simulados'
import {
  acertouVisivel,
  correcaoDisponivel,
  estadoDaAlternativa,
  statusDaQuestaoConfirmada,
} from './feedbackProva'

/* Cinza esmaecido das molduras e das etiquetas neutras (mesmo tom dos cards). */
const CINZA_ESMAECIDO = corComOpacidade(theme.colors.textTertiary, 0.15)

/* Só o conteúdo abaixo do SimuladoHeader tem padding e largura limitada. */
const Tela = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  min-height: 100vh;
`

const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};
`

const Alternativas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`

const Rodape = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

/* Mascote ao lado do card, que estica para acompanhar a altura da imagem. */
/* Moldura com o mesmo degradê do EnunciadoSimuladoCard. */
const FrameResultado = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl};

  background: ${theme.gradients.frame};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.floating};
`

const Mascote = styled.img`
  width: 120px;
  height: 180px;
  flex-shrink: 0;
  object-fit: contain;
  ${animacaoFlutuar}
`

const CardResultado = styled.div<{ $altura?: string }>`
  display: flex;
  flex: 1;
  align-self: ${({ $altura }) => ($altura ? 'auto' : 'stretch')};
  height: ${({ $altura }) => $altura ?? 'auto'};
  min-width: 280px;

  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${CINZA_ESMAECIDO};
  border-radius: ${({ theme }) => theme.radius.md};
`

const ColunaResultado = styled.div<{ $centralizado?: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: ${({ $centralizado }) => ($centralizado ? 'center' : 'flex-start')};
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`

const TextoSecundario = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textTertiary};
`

const Etiquetas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`

const Etiqueta = styled.span<{ $fundo: string; $claro?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $fundo }) => $fundo};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ $claro, theme }) => ($claro ? theme.colors.textSecondary : theme.colors.white)};

  svg {
    width: 16px;
    height: 16px;
  }
`

const ValorMoedas = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs} 0;

  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const NomeParabens = styled.strong`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const DescricaoParabens = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const QuestaoCabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const QuestaoEnunciado = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

/* Sem herdar o preto padrão do texto do card (#202020) — cinza, como o
   resto dos textos desta tela. */
const QuestaoTitulo = styled.strong`
  color: ${({ theme }) => theme.colors.textSecondary};
`

/** Espelha PontuacaoAlunoService.MOEDAS_POR_SIMULADO_CONCLUIDO no back. */
const MOEDAS_POR_SIMULADO = 10

interface QuestaoDaProva {
  questaoId: number
  enunciado: string
  tipo: TipoQuestao
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
  const { skinEquipada, imagemSkin } = useSkinEquipadaDoAluno(alunoId)

  const idTentativa = Number(simuladoAlunoId)

  const [indiceAtual, setIndiceAtual] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, number | null>>({})
  // V/F: cada afirmação é julgada à parte (true = Verdadeiro).
  const [respostasVF, setRespostasVF] = useState<Record<number, Record<number, boolean>>>({})
  // Até confirmar, a seleção pode ser trocada e nada é revelado.
  const [confirmadas, setConfirmadas] = useState<Record<number, boolean>>({})
  const [temposPorQuestao, setTemposPorQuestao] = useState<Record<number, number>>({})
  const [segundos, setSegundos] = useState(0)
  const [finalizando, setFinalizando] = useState(false)
  // Só vem no POST /finalizar; o GET de recarregamento não traz.
  const [diasProximaRevisao, setDiasProximaRevisao] = useState<number | null>(null)

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
  // Prova da própria tentativa: substitui o catálogo global de questões e
  // alternativas (que expunha o gabarito) por uma chamada escopada.
  const requisicaoProva = useRequisicao(() => simuladoAlunos.questoesDaTentativa(idTentativa), [idTentativa])
  const requisicaoRespostas = useRequisicao(
    () => questaoAlunos.listarPorSimuladoAluno(idTentativa),
    [idTentativa],
    { ativo: concluido },
  )

  const simulado = requisicaoSimulado.data

  const provaTentativa = requisicaoProva.data

  /**
   * Monta a prova já no formato que a tela usa. O `correta` de cada alternativa
   * vem do gabarito do servidor, que só existe depois de concluir — durante a
   * prova nenhuma alternativa chega marcada como correta.
   */
  const questoes = useMemo<QuestaoDaProva[]>(() => {
    return (provaTentativa?.questoes ?? []).map((questao) => ({
      questaoId: questao.questaoId,
      enunciado: questao.enunciado,
      tipo: questao.tipo,
      alternativas: questao.alternativas.map((alternativa) => ({
        id: alternativa.id,
        questaoId: questao.questaoId,
        texto: alternativa.texto,
        ordem: alternativa.ordem,
        correta: provaTentativa?.gabarito?.[String(alternativa.id)] === true,
      })),
    }))
  }, [provaTentativa])

  const tempoLimiteSegundos = simulado?.tempoLimite ? simulado.tempoLimite * 60 : null
  const restante = tempoLimiteSegundos !== null ? Math.max(0, tempoLimiteSegundos - segundos) : null

  // V/F só conta como respondida com todas as afirmações julgadas.
  function estaRespondida(questao: QuestaoDaProva) {
    if (questao.tipo === 'VERDADEIRO_FALSO') {
      const marcadas = respostasVF[questao.questaoId] ?? {}
      return questao.alternativas.length > 0 && questao.alternativas.every((a) => a.id in marcadas)
    }
    return typeof respostas[questao.questaoId] === 'number'
  }

  // Só acerta a questão quando TODAS as afirmações batem com o gabarito.
  function acertouQuestao(questao: QuestaoDaProva) {
    if (questao.tipo === 'VERDADEIRO_FALSO') {
      const marcadas = respostasVF[questao.questaoId] ?? {}
      return questao.alternativas.every((a) => marcadas[a.id] === Boolean(a.correta))
    }
    const escolhida = questao.alternativas.find((a) => a.id === respostas[questao.questaoId])
    return Boolean(escolhida?.correta)
  }

  // 'saida' finaliza como 'manual' no back; só muda o aviso e não mostra a correção.
  const finalizar = useCallback(
    async (motivo: 'manual' | 'tempo' | 'saida') => {
      if (finalizando) return

      setFinalizando(true)

      try {
        const resultado = await simuladoAlunos.finalizar(idTentativa, {
          respostas: questoes.map((questao) => ({
            questaoId: questao.questaoId,
            alternativaId: questao.tipo === 'VERDADEIRO_FALSO' ? null : (respostas[questao.questaoId] ?? null),
            // Afirmação sem resposta: a questão inteira vai em branco, sem lista parcial.
            alternativasVerdadeiras:
              questao.tipo === 'VERDADEIRO_FALSO' && estaRespondida(questao)
                ? questao.alternativas
                    .filter((a) => respostasVF[questao.questaoId]?.[a.id] === true)
                    .map((a) => a.id)
                : undefined,
            tempoResposta: temposPorQuestao[questao.questaoId],
          })),
          tempoGastoTotal: segundos,
          finalizadoPorTempo: motivo === 'tempo',
        })

        setDiasProximaRevisao(resultado.diasProximaRevisao ?? null)

        if (motivo === 'saida') {
          toast.error(
            'Simulado encerrado',
            'Você saiu antes de terminar — a tentativa foi finalizada e as questões não respondidas contam como erro.',
          )
          navegar('/aluno/reforco')
          return
        }

        toast.success(
          motivo === 'tempo' ? 'Tempo esgotado' : 'Simulado finalizado',
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
    [finalizando, idTentativa, questoes, respostas, respostasVF, temposPorQuestao, segundos],
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
    void finalizar('tempo')
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
  const ehVerdadeiroFalso = questaoAtual?.tipo === 'VERDADEIRO_FALSO'

  const respostaAtualId = questaoAtual ? respostas[questaoAtual.questaoId] : undefined
  const respostasVFAtual = questaoAtual ? (respostasVF[questaoAtual.questaoId] ?? {}) : {}
  const temSelecao = questaoAtual ? estaRespondida(questaoAtual) : false
  const revelada = questaoAtual ? Boolean(confirmadas[questaoAtual.questaoId]) : false
  // Em V/F há várias corretas: acerta se a escolhida for uma delas.
  const alternativaEscolhidaAtual = questaoAtual?.alternativas.find(
    (item) => item.id === respostaAtualId,
  )
  // Enquanto a tentativa esta PENDENTE o servidor devolve `gabarito: null`, entao
  // confirmar a resposta nao pode revelar acerto/erro: a correcao aparece depois
  // de finalizar, quando o gabarito chega.
  const temGabarito = correcaoDisponivel(provaTentativa?.gabarito)
  const mostrarCorrecao = revelada && temGabarito
  const acertouAtual = acertouVisivel({
    mostrarCorrecao,
    acertou: Boolean(
      questaoAtual && (ehVerdadeiroFalso ? acertouQuestao(questaoAtual) : alternativaEscolhidaAtual?.correta),
    ),
  })

  const textoBalao = !mostrarCorrecao
    ? questaoAtual?.enunciado
    : acertouAtual
      ? 'Você acertou, parabéns!'
      : 'Não foi dessa vez...'

  // Mesma revelação que troca a frase do balão troca a imagem do mascote:
  // feliz quando acerta, triste quando erra — volta ao normal na próxima questão.
  const mascoteReacao = !mostrarCorrecao
    ? imagemSkin
    : resolverImagemSkin(skinEquipada?.urlAsset, acertouAtual ? 'feliz' : 'triste')

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

  function confirmarResposta() {
    if (!questaoAtual || !temSelecao) return

    setConfirmadas((atuais) => ({ ...atuais, [questaoAtual.questaoId]: true }))
  }

  async function confirmarFinalizacao() {
    registrarTempoDaQuestao()

    const semResposta = questoes.filter((questao) => !estaRespondida(questao)).length

    await confirmar({
      titulo: 'Finalizar o simulado?',
      descricao:
        semResposta > 0
          ? `Você deixou ${semResposta} questão(ões) em branco — elas contam como erro. Deseja finalizar mesmo assim?`
          : 'Depois de finalizar não é possível alterar as respostas.',
      rotuloConfirmar: 'Finalizar',
      tone: semResposta > 0 ? 'danger' : 'default',
      aoConfirmar: () => finalizar('manual'),
    })
  }

  // Confirmada só vira verde/vermelho quando o gabarito chega; antes disso fica
  // apenas marcada como respondida.
  const statusProgresso = useMemo<QuestionProgressStatus[]>(
    () =>
      questoes.map((questao, indice) => {
        if (indice === indiceAtual) return 'current'

        if (confirmadas[questao.questaoId]) {
          return statusDaQuestaoConfirmada({ temGabarito, acertou: acertouQuestao(questao) })
        }

        return estaRespondida(questao) ? 'answered' : 'pending'
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questoes, indiceAtual, respostas, respostasVF, confirmadas, temGabarito],
  )

  const loading =
    requisicaoTentativa.loading ||
    requisicaoSimulado.loading ||
    requisicaoProva.loading

  if (requisicaoTentativa.error) {
    return (
      <Tela>
        <Conteudo>
          <ErroCarregamento
            mensagem={requisicaoTentativa.error}
            onRetry={requisicaoTentativa.reload}
          />
          <Button variant="secondary" onClick={() => navegar('/aluno/reforco')}>
            Voltar para o reforço
          </Button>
        </Conteudo>
      </Tela>
    )
  }

  if (loading) {
    return (
      <Tela>
        <Conteudo>
          <SkeletonCartao />
          <SkeletonCartao />
        </Conteudo>
      </Tela>
    )
  }

  if (concluido) {
    const tentativa = requisicaoTentativa.data
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

        <Conteudo>
        <FrameResultado>
          <Mascote src={imagemSkin} alt="" aria-hidden="true" />

          <CardResultado>
            <ColunaResultado>
              <div>
                <NomeParabens>Parabéns, {nomeCurto(usuario?.nomePessoa)}!</NomeParabens>
                <DescricaoParabens>
                  Continue assim para desenvolver seus conhecimentos, você vai longe!
                </DescricaoParabens>
              </div>

              <Etiquetas>
                {/* Mesmo verde/vermelho das alternativas (LetterBadge correct/incorrect) —
                    tokens.gradients.success/danger, não um verde/vermelho à parte. */}
                <Etiqueta $fundo={CINZA_ESMAECIDO} $claro>
                  Nota: {formatarNota(tentativa?.nota)}/{formatarNota(simulado?.notaMaxima ?? 10)}
                </Etiqueta>
                <Etiqueta $fundo={theme.gradients.success}>{acertos} acerto(s)</Etiqueta>
                <Etiqueta $fundo={theme.gradients.danger}>{erradas} erro(s)</Etiqueta>
                <Etiqueta $fundo={CINZA_ESMAECIDO} $claro>
                  <Clock aria-hidden="true" />
                  {formatarTempo(tentativa?.tempoGasto)}
                </Etiqueta>
              </Etiquetas>
            </ColunaResultado>
          </CardResultado>

          <CardResultado $altura="322px">
            <ColunaResultado $centralizado>
              <TextoSecundario>Para comemorar, aqui estão algumas moedas!</TextoSecundario>

              <ValorMoedas>
                + {formatarMoedas(MOEDAS_POR_SIMULADO)}
                <MoedaIcone size={32} aria-hidden="true" />
              </ValorMoedas>

              <TextoSecundario>
                {diasProximaRevisao === null
                  ? 'Continue praticando os simulados disponíveis, até a próxima!'
                  : diasProximaRevisao <= 0
                    ? 'Este conteúdo já está disponível para revisão — até logo!'
                    : `Este conteúdo voltará em ${diasProximaRevisao} dia${diasProximaRevisao === 1 ? '' : 's'} para sua revisão, então até logo!`}
              </TextoSecundario>

              <TextoSecundario>
                Até lá, continue no ritmo e faça os simulados que já estão prontos!
              </TextoSecundario>

              <Button variant="info" noBorder fullWidth onClick={() => navegar('/aluno/reforco')}>
                Ver simulados para realizar
              </Button>
            </ColunaResultado>
          </CardResultado>
        </FrameResultado>

        <Stack gap="md">
          {questoes.map((questao, indice) => {
            const resposta = respostasDoAluno.get(questao.questaoId)

            const ehVF = questao.tipo === 'VERDADEIRO_FALSO'
            const marcadasVerdadeiras = new Set(resposta?.alternativasVerdadeirasIds ?? [])
            // Tentativas antigas têm `respondida` nulo: sem fallback apareceriam
            // "Em branco". Em ALTERNATIVAS, alternativaId presente é confiável.
            const respondida =
              resposta?.respondida ??
              (ehVF ? (resposta?.alternativasVerdadeirasIds?.length ?? 0) > 0 : resposta?.alternativaId != null)

            return (
              <Card key={questao.questaoId}>
                <QuestaoCabecalho>
                  <QuestaoTitulo>Questão {indice + 1}</QuestaoTitulo>

                  {!respondida ? (
                    <Tag variant="neutral">Em branco</Tag>
                  ) : resposta?.acertou ? (
                    <Tag variant="success">
                      Você acertou
                    </Tag>
                  ) : (
                    <Tag variant="error">
                      Você errou
                    </Tag>
                  )}
                </QuestaoCabecalho>

                <QuestaoEnunciado>{questao.enunciado}</QuestaoEnunciado>

                <Alternativas>
                  {ehVF
                    ? questao.alternativas.map((alternativa) => (
                        <AlternativaVerdadeiroFalso
                          key={alternativa.id}
                          texto={alternativa.texto}
                          valor={respondida ? marcadasVerdadeiras.has(alternativa.id) : null}
                          revelado
                          correta={alternativa.correta}
                          disabled
                        />
                      ))
                    : questao.alternativas.map((alternativa, posicao) => {
                        const marcada = alternativa.id === resposta?.alternativaId

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
            )
          })}
        </Stack>
        </Conteudo>
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
        <Conteudo>
          <ErroCarregamento
            titulo="Simulado sem questões"
            mensagem="Este simulado ainda não tem questões ativas. Avise seu professor."
          />
        </Conteudo>
      </Tela>
    )
  }

  return (
    <Tela>
      <SimuladoHeader
        titulo={simulado?.titulo ?? 'Simulado'}
        segundos={restante ?? segundos}
        regressivo={restante !== null}
        onExit={() =>
          confirmar({
            titulo: 'Sair do simulado?',
            descricao:
              'Depois de iniciado, o simulado não pode ser retomado — sair agora finaliza a tentativa e as questões não respondidas contam como erro. Essa ação não pode ser desfeita.',
            rotuloConfirmar: 'Sair e finalizar',
            tone: 'danger',
            aoConfirmar: () => finalizar('saida'),
          })
        }
      />

      <Conteudo>
      <ProgressoSimuladoCard
        current={indiceAtual + 1}
        total={questoes.length}
        status={statusProgresso}
        onGoTo={irPara}
        showLegend={false}
      />

      <EnunciadoSimuladoCard enunciado={textoBalao ?? questaoAtual.enunciado} mascoteSrc={mascoteReacao} />

      <Alternativas>
        {ehVerdadeiroFalso
          ? questaoAtual.alternativas.map((alternativa) => (
              <AlternativaVerdadeiroFalso
                key={alternativa.id}
                texto={alternativa.texto}
                valor={respostasVFAtual[alternativa.id] ?? null}
                disabled={revelada}
                revelado={mostrarCorrecao}
                correta={alternativa.correta}
                onSelect={(valor) => {
                  if (revelada) return

                  // Pode trocar livremente antes de confirmar — só trava depois
                  // de clicar em "Confirmar resposta".
                  setRespostasVF((atuais) => ({
                    ...atuais,
                    [questaoAtual.questaoId]: { ...(atuais[questaoAtual.questaoId] ?? {}), [alternativa.id]: valor },
                  }))
                }}
              />
            ))
          : questaoAtual.alternativas.map((alternativa, posicao) => (
              <AlternativaButton
                key={alternativa.id}
                letra={letraAlternativa(posicao)}
                texto={alternativa.texto}
                disabled={revelada}
                state={estadoDaAlternativa({
                  revelada: mostrarCorrecao,
                  correta: Boolean(alternativa.correta),
                  selecionada: alternativa.id === respostaAtualId,
                })}
                onSelect={() => {
                  if (revelada) return

                  // Pode trocar livremente antes de confirmar — só trava depois
                  // de clicar em "Confirmar resposta".
                  setRespostas((atuais) => ({ ...atuais, [questaoAtual.questaoId]: alternativa.id }))
                }}
              />
            ))}
      </Alternativas>

      <Rodape>
        <Button
          variant="info"
          size="large"
          noBorder
          icon={<ArrowLeft />}
          disabled={indiceAtual === 0}
          onClick={() => irPara(indiceAtual - 1)}
        >
          Anterior
        </Button>

        {temSelecao && !revelada ? (
          // Trava a resposta escolhida — dá a chance de trocar se o toque na
          // alternativa foi sem querer. O acerto/erro só aparece com o gabarito.
          <Button
            variant="info"
            size="large"
            noBorder
            icon={<CheckCircle2 />}
            onClick={confirmarResposta}
          >
            Confirmar resposta
          </Button>
        ) : indiceAtual < questoes.length - 1 ? (
          <Button
            variant="info"
            size="large"
            noBorder
            iconRight={<ArrowRight />}
            onClick={() => irPara(indiceAtual + 1)}
          >
            Próxima
          </Button>
        ) : (
          <Button
            variant="success"
            size="large"
            noBorder
            icon={<Flag />}
            loading={finalizando}
            onClick={confirmarFinalizacao}
          >
            Finalizar simulado
          </Button>
        )}
      </Rodape>
      </Conteudo>
    </Tela>
  )
}
