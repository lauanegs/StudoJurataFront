import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Flag } from 'lucide-react'

import { AlternativaButton } from '../../components/ui/AlternativaButton'
import { AlternativaCard } from '../../components/ui/AlternativaCard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EnunciadoSimuladoCard } from '../../components/ui/EnunciadoSimuladoCard'
import { MoedaIcone } from '../../components/ui/MoedaIcone'
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
import { formatarMoedas, formatarTempo, letraAlternativa, nomeCurto } from '../../utils/format'
import { resolverImagemSkin } from '../../utils/skins'
import { animacaoFlutuar } from '../../styles/animations'
import { theme } from '../../styles/theme'
import type { AlternativaResponse } from '../../types'

/* Confirmado no Figma: o cabeçalho (SimuladoHeader) cobre a largura inteira
   da tela, encostado nas bordas — só o conteúdo abaixo dele (progresso,
   enunciado, alternativas) fica com padding, centralizado num miolo de
   largura limitada. */
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

/* Confirmado no Figma: o mascote fica FORA do card, ao lado — não mais
   dentro dele — e o card se estica (self-stretch) pra acompanhar a altura
   da imagem. */
/* Confirmado no Figma (nó 220:3228): moldura com o mesmo degradê azul
   horizontal do EnunciadoSimuladoCard, envolvendo o mascote + os dois
   cartões brancos — não mais soltos direto no fundo cinza da página. */
const FrameResultado = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl};

  background: linear-gradient(90deg, #049dbf 0%, rgba(4, 157, 191, 0.5) 100%), #e6eaf2;
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
  border: 1px solid rgba(115, 115, 115, 0.15);
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

/* Confirmado no Figma: as 3 etiquetas (acertos/erros/tempo) ficam empilhadas
   na vertical, cada uma ocupando a largura toda — não mais lado a lado. */
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

const RevisaoLista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
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

/** Mesma quantidade pra qualquer simulado, independente da nota — regra do
 * back (PontuacaoAlunoService.MOEDAS_POR_SIMULADO_CONCLUIDO). */
const MOEDAS_POR_SIMULADO = 10

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
  const { skinEquipada, imagemSkin } = useSkinEquipadaDoAluno(alunoId)

  const idTentativa = Number(simuladoAlunoId)

  const [indiceAtual, setIndiceAtual] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, number | null>>({})
  // Marca em quais questões o aluno já clicou em "Confirmar resposta" — até lá,
  // a seleção pode ser trocada livremente e nada é revelado (evita que um
  // toque sem querer numa alternativa já feche a questão como respondida).
  const [confirmadas, setConfirmadas] = useState<Record<number, boolean>>({})
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

  const respostaAtualId = questaoAtual ? respostas[questaoAtual.questaoId] : undefined
  const temSelecao = typeof respostaAtualId === 'number'
  const revelada = questaoAtual ? Boolean(confirmadas[questaoAtual.questaoId]) : false
  // V/F pode ter mais de uma alternativa `correta` (cada afirmação julgada à
  // parte) — "acertou" não é "escolheu a mesma id que uma correta fixa", é
  // "a alternativa que o aluno escolheu é, ela mesma, uma correta".
  const alternativaEscolhidaAtual = questaoAtual?.alternativas.find(
    (item) => item.id === respostaAtualId,
  )
  const acertouAtual = revelada && Boolean(alternativaEscolhidaAtual?.correta)

  // Já dá pra saber se acertou assim que o aluno responde: as alternativas
  // (com `correta`) já estão todas carregadas no cliente antes mesmo da
  // primeira resposta — o back só calcula é a NOTA final, em /finalizar.
  // Por isso o balão do mascote pode trocar de frase na hora, sem precisar
  // de nenhum card novo. Só troca depois de "Confirmar resposta" — clicar
  // numa alternativa sozinho ainda não revela nada, pra dar chance de trocar
  // se foi sem querer.
  const textoBalao = !revelada
    ? questaoAtual?.enunciado
    : acertouAtual
      ? 'Você acertou, parabéns! 🎉'
      : 'Não foi dessa vez... 😕'

  // Mesma revelação que troca a frase do balão troca a imagem do mascote:
  // feliz quando acerta, triste quando erra — volta ao normal na próxima questão.
  const mascoteReacao = !revelada
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

    const semResposta = questoes.filter((questao) => !respostas[questao.questaoId]).length

    await confirmar({
      titulo: 'Finalizar o simulado?',
      descricao:
        semResposta > 0
          ? `Você deixou ${semResposta} questão(ões) em branco — elas contam como erro. Deseja finalizar mesmo assim?`
          : 'Depois de finalizar não é possível alterar as respostas.',
      rotuloConfirmar: 'Finalizar',
      tone: semResposta > 0 ? 'danger' : 'default',
      aoConfirmar: () => finalizar(false),
    })
  }

  // Confirmado no Figma: os marcadores de progresso ficam verde/vermelho nas
  // questões já confirmadas (não só um "respondida" genérico).
  const statusProgresso = useMemo<QuestionProgressStatus[]>(
    () =>
      questoes.map((questao, indice) => {
        if (indice === indiceAtual) return 'current'

        if (confirmadas[questao.questaoId]) {
          const escolhida = questao.alternativas.find(
            (alternativa) => alternativa.id === respostas[questao.questaoId],
          )
          return escolhida?.correta ? 'correct' : 'incorrect'
        }

        return respostas[questao.questaoId] ? 'answered' : 'pending'
      }),
    [questoes, indiceAtual, respostas, confirmadas],
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
                <Etiqueta $fundo={theme.gradients.success}>{acertos} acerto(s)</Etiqueta>
                <Etiqueta $fundo={theme.gradients.danger}>{erradas} erro(s)</Etiqueta>
                <Etiqueta $fundo="rgba(115, 115, 115, 0.15)" $claro>
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
                Este conteúdo voltará em 2 dias para sua revisão, então até logo!
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

        <RevisaoLista>
          {questoes.map((questao, indice) => {
            const resposta = respostasDoAluno.get(questao.questaoId)

            return (
              <Card key={questao.questaoId}>
                <QuestaoCabecalho>
                  <QuestaoTitulo>Questão {indice + 1}</QuestaoTitulo>

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
                </QuestaoCabecalho>

                <QuestaoEnunciado>{questao.enunciado}</QuestaoEnunciado>

                <Alternativas>
                  {questao.alternativas.map((alternativa, posicao) => {
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
        </RevisaoLista>
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
            descricao: 'Suas respostas não serão salvas e a tentativa continuará pendente.',
            rotuloConfirmar: 'Sair',
            tone: 'danger',
            aoConfirmar: async () => navegar('/aluno/reforco'),
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
        {questaoAtual.alternativas.map((alternativa, posicao) => (
          <AlternativaButton
            key={alternativa.id}
            letra={letraAlternativa(posicao)}
            texto={alternativa.texto}
            disabled={revelada}
            state={
              revelada
                ? alternativa.correta
                  ? 'correct'
                  : alternativa.id === respostaAtualId
                    ? 'incorrect'
                    : 'default'
                : alternativa.id === respostaAtualId
                  ? 'selected'
                  : 'default'
            }
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
          // Só revela acerto/erro depois desse clique — dá a chance de
          // trocar a resposta se o toque na alternativa foi sem querer.
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
