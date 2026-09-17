import { questaoVazia, type QuestaoEditavel } from '../../../../components/simulados/QuestaoEditor/types'
import type { AlternativaResponse, QuestaoResponse } from '../../../../types/simulados'

/** Regra de negócio: um simulado nunca pode ter mais que 10 questões (ver SimuladoQuestaoService no back). */
export const MAXIMO_QUESTOES = 10

function alternativasDaQuestao(questaoId: number, alternativas: AlternativaResponse[]) {
  return alternativas
    .filter((alternativa) => alternativa.questaoId === questaoId)
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
}

/**
 * Cópia de uma questão existente, sem `id`: com id, `salvar()` assumiria que já
 * está vinculada a este simulado e não criaria o SimuladoQuestao.
 */
export function copiarQuestao(
  original: QuestaoResponse,
  alternativas: AlternativaResponse[],
  disciplinaPadrao: number | null,
): QuestaoEditavel {
  const copiadas = alternativasDaQuestao(original.id, alternativas).map((alternativa) => ({
    texto: alternativa.texto,
    correta: Boolean(alternativa.correta),
  }))

  return {
    enunciado: original.enunciado,
    tipo: original.tipo,
    disciplinaId: original.disciplinaId ?? disciplinaPadrao,
    nivelDificuldade: original.nivelDificuldade ?? 'MEDIA',
    alternativas: copiadas.length >= 2 ? copiadas : questaoVazia().alternativas,
  }
}

/** Questão já vinculada a este simulado, mantendo os ids para atualizar no lugar. */
export function carregarQuestao(original: QuestaoResponse, alternativas: AlternativaResponse[]): QuestaoEditavel {
  return {
    id: original.id,
    enunciado: original.enunciado,
    tipo: original.tipo,
    disciplinaId: original.disciplinaId ?? null,
    nivelDificuldade: original.nivelDificuldade ?? null,
    status: original.status,
    alternativas: alternativasDaQuestao(original.id, alternativas).map((alternativa) => ({
      id: alternativa.id,
      texto: alternativa.texto,
      correta: Boolean(alternativa.correta),
    })),
  }
}
