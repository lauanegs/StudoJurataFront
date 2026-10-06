import type { ConferenciaDaQuestao, ProvaDaTentativa } from '@/dominios/simulados/types'
import type { QuestaoDaProva } from './types'

import type { RespostasAlternativa, RespostasVerdadeiroFalso } from './types'
/** Prova no formato que a tela usa */
export function montarQuestoesDaProva(
  prova: ProvaDaTentativa | null | undefined,
  conferencias: Record<number, ConferenciaDaQuestao>,
): QuestaoDaProva[] {
  return (prova?.questoes ?? []).map((questao) => ({
    questaoId: questao.questaoId,
    enunciado: questao.enunciado,
    tipo: questao.tipo,
    alternativas: questao.alternativas.map((alternativa) => ({
      id: alternativa.id,
      questaoId: questao.questaoId,
      texto: alternativa.texto,
      ordem: alternativa.ordem,
      correta:
        prova?.gabarito?.[String(alternativa.id)] === true ||
        Boolean(conferencias[questao.questaoId]?.alternativasCorretasIds.includes(alternativa.id)),
    })),
  }))
}

/** V/F só conta como respondida com todas as afirmações julgadas */
export function questaoRespondida(
  questao: QuestaoDaProva,
  respostas: RespostasAlternativa,
  respostasVF: RespostasVerdadeiroFalso,
): boolean {
  if (questao.tipo === 'VERDADEIRO_FALSO') {
    const marcadas = respostasVF[questao.questaoId] ?? {}
    return questao.alternativas.length > 0 && questao.alternativas.every((a) => a.id in marcadas)
  }
  return typeof respostas[questao.questaoId] === 'number'
}

/** Só acerta a questão V/F quando TODAS as afirmações batem com o gabarito */
export function questaoAcertada(
  questao: QuestaoDaProva,
  respostas: RespostasAlternativa,
  respostasVF: RespostasVerdadeiroFalso,
): boolean {
  if (questao.tipo === 'VERDADEIRO_FALSO') {
    const marcadas = respostasVF[questao.questaoId] ?? {}
    return questao.alternativas.every((a) => marcadas[a.id] === Boolean(a.correta))
  }
  const escolhida = questao.alternativas.find((a) => a.id === respostas[questao.questaoId])
  return Boolean(escolhida?.correta)
}
