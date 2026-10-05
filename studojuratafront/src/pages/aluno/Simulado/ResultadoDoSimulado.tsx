import styled from 'styled-components'
import { Clock } from 'lucide-react'

import { AlternativaCard } from '@/components/simulados/AlternativaCard'
import { AlternativaVerdadeiroFalso } from '@/components/simulados/AlternativaVerdadeiroFalso'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MoedaIcone } from '@/components/gamificacao/MoedaIcone'
import { SimuladoHeader } from '@/components/simulados/SimuladoHeader'
import { Stack } from '@/components/ui/Stack'
import { Tag } from '@/components/ui/Tag'
import { animacaoFlutuar } from '@/styles/animations'
import { theme } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'
import { formatarMoedas, formatarNota, formatarTempo, letraAlternativa, nomeCurto } from '@/utils/format'
import type { QuestaoAlunoResponse, SimuladoAlunoResponse, SimuladoResponse } from '@/types/simulados'
import { ganhouMoedas, mensagemDoResultado } from './feedbackProva'
import { Alternativas, Conteudo, Tela } from './styles'
import type { QuestaoDaProva } from './tipos'

/* Cinza esmaecido das molduras e das etiquetas neutras (mesmo tom dos cards). */
const CINZA_ESMAECIDO = corComOpacidade(theme.colors.textTertiary, 0.15)

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

interface ResultadoDoSimuladoProps {
  tentativa?: SimuladoAlunoResponse | null
  simulado?: SimuladoResponse | null
  questoes: QuestaoDaProva[]
  respostas: QuestaoAlunoResponse[]
  nomeDoAluno?: string | null
  imagemSkin: string
  diasProximaRevisao: number | null
  aoVoltar: () => void
}

/** Tela de resultado: frase pelo desempenho, nota, moedas, próxima revisão e a correção questão a questão. */
export function ResultadoDoSimulado({
  tentativa,
  simulado,
  questoes,
  respostas,
  nomeDoAluno,
  imagemSkin,
  diasProximaRevisao,
  aoVoltar,
}: ResultadoDoSimuladoProps) {
  const acertos = tentativa?.quantidadeAcertos ?? 0
  const erradas = questoes.length - acertos

  const respostasDoAluno = new Map(
    respostas.map((resposta) => [resposta.questaoId, resposta]),
  )
  const respondidas = questoes.filter((questao) => {
    const resposta = respostasDoAluno.get(questao.questaoId)
    return (
      resposta?.respondida ??
      (questao.tipo === 'VERDADEIRO_FALSO'
        ? (resposta?.alternativasVerdadeirasIds?.length ?? 0) > 0
        : resposta?.alternativaId != null)
    )
  }).length
  const mensagem = mensagemDoResultado({
    nome: nomeCurto(nomeDoAluno) ?? '',
    acertos,
    total: questoes.length,
    respondidas,
  })
  const rendeuMoedas = ganhouMoedas(respondidas, questoes.length)

  return (
    <Tela>
      <SimuladoHeader
        titulo={simulado?.titulo ?? 'Simulado'}
        segundos={tentativa?.tempoGasto ?? 0}
        onExit={() => aoVoltar()}
        rotuloSair="Voltar"
      />

      <Conteudo>
      <FrameResultado>
        <Mascote src={imagemSkin} alt="" aria-hidden="true" />

        <CardResultado>
          <ColunaResultado>
            <div>
              <NomeParabens>{mensagem.titulo}</NomeParabens>
              <DescricaoParabens>{mensagem.descricao}</DescricaoParabens>
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
            {rendeuMoedas ? (
              <>
                <TextoSecundario>Para comemorar, aqui estão algumas moedas!</TextoSecundario>

                <ValorMoedas>
                  + {formatarMoedas(MOEDAS_POR_SIMULADO)}
                  <MoedaIcone size={32} aria-hidden="true" />
                </ValorMoedas>
              </>
            ) : (
              <TextoSecundario>
                Você deixou questões em branco, então desta vez não houve ganho de moedas. Responda
                todas as questões no próximo simulado para ganhar!
              </TextoSecundario>
            )}

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

            <Button variant="info" noBorder fullWidth onClick={() => aoVoltar()}>
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
