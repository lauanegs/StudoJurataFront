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

export interface MensagemResultado {
  titulo: string
  descricao: string
}

/**
 * Frase da tela de resultado de acordo com o desempenho — antes era sempre
 * "Parabéns". Questão em branco pesa: quem não respondeu tudo não ganha moedas,
 * e a mensagem fala disso em vez de comemorar.
 */
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

/** Moedas só quando a prova foi toda respondida (mesma regra do back). */
export function ganhouMoedas(respondidas: number, total: number): boolean {
  return total > 0 && respondidas === total
}
