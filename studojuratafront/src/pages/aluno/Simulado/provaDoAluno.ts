import type { ConferenciaDaQuestao, ProvaDaTentativa } from '@/dominios/simulados/types'
import type { QuestaoDaProva } from './types'

export type RespostasAlternativa = Record<number, number | null>
/** V/F: por questão, cada afirmação julgada à parte (true = Verdadeiro). */
export type RespostasVerdadeiroFalso = Record<number, Record<number, boolean>>

/**
 * Prova no formato que a tela usa. O `correta` de cada alternativa vem do
 * gabarito do servidor (só existe depois de concluir) ou da conferência da
 * própria questão — durante a prova nenhuma alternativa chega marcada como correta.
 */
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

/** V/F só conta como respondida com todas as afirmações julgadas. */
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

/** Só acerta a questão V/F quando TODAS as afirmações batem com o gabarito. */
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
