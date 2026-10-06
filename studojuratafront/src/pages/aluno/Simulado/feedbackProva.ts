import type { LetterState } from '@/components/simulados/LetterBadge'
import type { QuestionProgressStatus } from '@/components/simulados/ProgressoSimuladoCard'

import type { MensagemResultado } from './types'
/** Feedback da prova em andamento */
export function correcaoDisponivel(gabarito: Record<string, boolean> | null | undefined): boolean {
  return gabarito != null
}

/** Acerto so aparece quando a correcao esta disponivel */
export function acertouVisivel(params: { mostrarCorrecao: boolean; acertou: boolean }): boolean {
  return params.mostrarCorrecao && params.acertou
}

/** Estado visual da alternativa */
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

/** Questao confirmada sem gabarito fica "respondida", nunca verde/vermelho */
export function statusDaQuestaoConfirmada(params: {
  temGabarito: boolean
  acertou: boolean
}): QuestionProgressStatus {
  if (!params.temGabarito) return 'answered'
  return params.acertou ? 'correct' : 'incorrect'
}

/** Frase da tela de resultado de acordo com o desempenho — antes era sempre "Parabéns" */
export function mensagemDoResultado(params: {
  nome: string
  acertos: number
  total: number
  respondidas: number
}): MensagemResultado {
  const { nome, acertos, total, respondidas } = params
  const sufixo = nome ? `, ${nome}` : ''

  if (total > 0 && respondidas === 0) {
    return {
      titulo: `Você não respondeu nenhuma questão${sufixo}`,
      descricao: 'Da próxima vez, tente responder todas — mesmo um palpite ajuda a revelar o que você já sabe.',
    }
  }

  const percentual = total > 0 ? (acertos / total) * 100 : 0

  if (percentual >= 70) {
    return { titulo: `Parabéns${sufixo}!`, descricao: 'Continue assim para desenvolver seus conhecimentos, você vai longe!' }
  }
  if (percentual >= 40) {
    return { titulo: `Bom trabalho${sufixo}!`, descricao: 'Você está no caminho. Revise o que errou e vai melhorar na próxima!' }
  }
  return {
    titulo: `Não desanime${sufixo}!`,
    descricao: 'Errar faz parte de aprender. Revise a correção abaixo e tente de novo no próximo simulado.',
  }
}

/** Moedas só quando a prova foi toda respondida (mesma regra do back) */
export function ganhouMoedas(respondidas: number, total: number): boolean {
  return total > 0 && respondidas === total
}
