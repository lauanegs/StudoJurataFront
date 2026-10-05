import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Flag } from 'lucide-react'

import { AlternativaButton } from '@/components/simulados/AlternativaButton'
import { AlternativaVerdadeiroFalso } from '@/components/simulados/AlternativaVerdadeiroFalso'
import { Button } from '@/components/ui/Button'
import { EnunciadoSimuladoCard } from '@/components/simulados/EnunciadoSimuladoCard'
import {
  ProgressoSimuladoCard,
  type QuestionProgressStatus,
} from '@/components/simulados/ProgressoSimuladoCard'
import { SimuladoHeader } from '@/components/simulados/SimuladoHeader'
import { ErroCarregamento } from '@/components/feedback/ErroCarregamento'
import { SkeletonCartao } from '@/components/feedback/Skeleton'
import { useConfirm } from '@/contexts/confirm/confirmContexto'
import { useToast } from '@/contexts/toast/toastContexto'
import { useAuth } from '@/hooks/useAuth'
import { useAlunoLogado, useSkinEquipadaDoAluno } from '@/hooks/usePerfilLogado'
import { useRequisicao } from '@/hooks/useRequisicao'
import { ApiError } from '@/dominios/comum/api'
import {
  questaoAlunos,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '@/dominios/simulados/service'
import { letraAlternativa } from '@/utils/format'
import { resolverImagemSkin } from '@/utils/skins'
import type { ConferenciaDaQuestao } from '@/dominios/simulados/types'
import { acertouVisivel, correcaoDisponivel, estadoDaAlternativa, statusDaQuestaoConfirmada } from './feedbackProva'
import { montarQuestoesDaProva, questaoAcertada, questaoRespondida } from './provaDoAluno'
import { ResultadoDoSimulado } from './ResultadoDoSimulado'
import { Alternativas, Conteudo, Rodape, Tela } from './styles'
import type { QuestaoDaProva } from './types'

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
  // Retorno de POST /conferir-questao: acerto e alternativas corretas de cada questão confirmada.
  const [conferencias, setConferencias] = useState<Record<number, ConferenciaDaQuestao>>({})
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

  const questoes = useMemo<QuestaoDaProva[]>(
    () => montarQuestoesDaProva(provaTentativa, conferencias),
    [provaTentativa, conferencias],
  )

  const tempoLimiteSegundos = simulado?.tempoLimite ? simulado.tempoLimite * 60 : null
  const restante = tempoLimiteSegundos !== null ? Math.max(0, tempoLimiteSegundos - segundos) : null

  const estaRespondida = (questao: QuestaoDaProva) => questaoRespondida(questao, respostas, respostasVF)
  const acertouQuestao = (questao: QuestaoDaProva) => questaoAcertada(questao, respostas, respostasVF)

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

        await Promise.all([requisicaoTentativa.reload(), requisicaoProva.reload(), requisicaoRespostas.reload()])
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
  // Durante a prova o gabarito de cada questão chega na conferência (confirmar
  // resposta); depois de finalizar, vem no GET da prova.
  const conferenciaAtual = questaoAtual ? conferencias[questaoAtual.questaoId] : undefined
  const temGabarito = Boolean(conferenciaAtual) || correcaoDisponivel(provaTentativa?.gabarito)
  const mostrarCorrecao = revelada && temGabarito
  const acertouAtual = acertouVisivel({
    mostrarCorrecao,
    acertou: Boolean(
      conferenciaAtual?.acertou ??
        (questaoAtual && (ehVerdadeiroFalso ? acertouQuestao(questaoAtual) : alternativaEscolhidaAtual?.correta)),
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

  const [conferindo, setConferindo] = useState(false)

  async function confirmarResposta() {
    if (!questaoAtual || !temSelecao || conferindo) return

    setConferindo(true)
    try {
      const conferencia = await simuladoAlunos.conferirQuestao(idTentativa, {
        questaoId: questaoAtual.questaoId,
        alternativaId: ehVerdadeiroFalso ? null : (respostas[questaoAtual.questaoId] ?? null),
        alternativasVerdadeiras: ehVerdadeiroFalso
          ? questaoAtual.alternativas.filter((a) => respostasVFAtual[a.id] === true).map((a) => a.id)
          : undefined,
        tempoResposta:
          (temposPorQuestao[questaoAtual.questaoId] ?? 0) +
          Math.round((Date.now() - inicioQuestaoRef.current) / 1000),
      })

      setConferencias((atuais) => ({ ...atuais, [questaoAtual.questaoId]: conferencia }))
      setConfirmadas((atuais) => ({ ...atuais, [questaoAtual.questaoId]: true }))
    } catch (erroConferir) {
      toast.error('Não foi possível confirmar', erroConferir instanceof ApiError ? erroConferir.message : undefined)
    } finally {
      setConferindo(false)
    }
  }

  function pedirSaida() {
    return confirmar({
      titulo: 'Sair do simulado?',
      descricao:
        'Depois de iniciado, o simulado não pode ser retomado — sair agora finaliza a tentativa e as questões não respondidas contam como erro. Essa ação não pode ser desfeita.',
      rotuloConfirmar: 'Sair e finalizar',
      tone: 'danger',
      aoConfirmar: () => finalizar('saida'),
    })
  }

  // O "voltar" do navegador não passa pelo beforeunload: sem esta trava o aluno
  // sairia da prova sem finalizar e poderia reabri-la com o tempo zerado.
  const pedirSaidaRef = useRef(pedirSaida)
  useEffect(() => {
    pedirSaidaRef.current = pedirSaida
  })

  useEffect(() => {
    if (concluido) return

    window.history.pushState(null, '', window.location.href)
    function aoVoltar() {
      window.history.pushState(null, '', window.location.href)
      void pedirSaidaRef.current()
    }

    window.addEventListener('popstate', aoVoltar)
    return () => window.removeEventListener('popstate', aoVoltar)
  }, [concluido])

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
          return statusDaQuestaoConfirmada({
            temGabarito: Boolean(conferencias[questao.questaoId]) || correcaoDisponivel(provaTentativa?.gabarito),
            acertou: conferencias[questao.questaoId]?.acertou ?? acertouQuestao(questao),
          })
        }

        return estaRespondida(questao) ? 'answered' : 'pending'
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questoes, indiceAtual, respostas, respostasVF, confirmadas, conferencias, provaTentativa],
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
    return (
      <ResultadoDoSimulado
        tentativa={requisicaoTentativa.data}
        simulado={simulado}
        questoes={questoes}
        respostas={requisicaoRespostas.data ?? []}
        nomeDoAluno={usuario?.nomePessoa}
        imagemSkin={imagemSkin}
        diasProximaRevisao={diasProximaRevisao}
        aoVoltar={() => navegar('/aluno/reforco')}
      />
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
        onExit={pedirSaida}
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
            loading={conferindo}
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
