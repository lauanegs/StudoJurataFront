import type { LetterState } from '../../components/simulados/LetterBadge'
import type { QuestionProgressStatus } from '../../components/simulados/ProgressoSimuladoCard'

/**
 * Feedback da prova em andamento.
 *
 * O servidor so entrega o gabarito depois que a tentativa e concluida
 * (GET /simulado-aluno/{id}/questoes responde `gabarito: null` enquanto ela esta
 * PENDENTE, para nao revelar a resposta certa durante a prova). Por isso a tela
 * so pode marcar acerto/erro quando o gabarito chegou: sem essa checagem,
 * `alternativa.correta` vem sempre falso e toda resposta confirmada apareceria
 * como errada, antes mesmo de o aluno finalizar.
 */
export function correcaoDisponivel(gabarito: Record<string, boolean> | null | undefined): boolean {
  return gabarito != null
}

/** Acerto so aparece quando a correcao esta disponivel. */
export function acertouVisivel(params: { mostrarCorrecao: boolean; acertou: boolean }): boolean {
  return params.mostrarCorrecao && params.acertou
}

/**
 * Estado visual da alternativa. `revelada` significa "a correcao pode ser
 * exibida" (confirmada e com gabarito), nao apenas "resposta confirmada".
 */
export function estadoDaAlternativa(params: {
  revelada: boolean
  correta: boolean
  selecionada: boolean
}): LetterState {
  if (!params.revelada) {
    return params.selecionada ? 'selected' : 'default'
  }
  if (params.correta) return 'correct'
  return params.selecionada ? 'incorrect' : 'default'
}

/** Questao confirmada sem gabarito fica "respondida", nunca verde/vermelho. */
export function statusDaQuestaoConfirmada(params: {
  temGabarito: boolean
  acertou: boolean
}): QuestionProgressStatus {
  if (!params.temGabarito) return 'answered'
  return params.acertou ? 'correct' : 'incorrect'
}
