import { Clock } from 'lucide-react'

import { QuestaoCorrigida } from '@/components/simulados/QuestaoCorrigida'
import { Button } from '@/components/ui/Button'
import { MoedaIcone } from '@/components/gamificacao/MoedaIcone'
import { SimuladoHeader } from '@/components/simulados/SimuladoHeader'
import { Stack } from '@/components/ui/Stack'
import { theme } from '@/styles/theme'
import { formatarMoedas, formatarNota, formatarTempo, nomeCurto } from '@/utils/format'
import { ganhouMoedas, mensagemDoResultado } from './feedbackProva'
import { CINZA_ESMAECIDO, Conteudo, Tela } from './styles'
import { FrameResultado, Mascote, CardResultado, ColunaResultado, TextoSecundario, Etiquetas, Etiqueta, ValorMoedas, NomeParabens, DescricaoParabens } from './styles'
import type { ResultadoDoSimuladoProps } from './types'

/** Espelha PontuacaoAlunoService.MOEDAS_POR_SIMULADO_CONCLUIDO no back */
const MOEDAS_POR_SIMULADO = 10

/** Tela de resultado: frase pelo desempenho, nota, moedas, próxima revisão e a correção questão a questão */
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
              {/* Mesmo verde/vermelho das alternativas (LetterBadge correct/incorrect) */}
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
          // Tentativas antigas têm `respondida` nulo: sem fallback apareceriam "Em branco"
          const respondida =
            resposta?.respondida ??
            (ehVF ? (resposta?.alternativasVerdadeirasIds?.length ?? 0) > 0 : resposta?.alternativaId != null)

          return (
            <QuestaoCorrigida
              key={questao.questaoId}
              numero={indice + 1}
              enunciado={questao.enunciado}
              ehVF={ehVF}
              respondida={respondida}
              acertou={Boolean(resposta?.acertou)}
              rotuloAcerto="Você acertou"
              rotuloErro="Você errou"
              alternativas={questao.alternativas}
              marcadasVerdadeiras={marcadasVerdadeiras}
              alternativaMarcada={resposta?.alternativaId ?? null}
            />
          )
        })}
      </Stack>
      </Conteudo>
    </Tela>
  )
}
