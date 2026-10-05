import { questaoVazia, type QuestaoEditavel } from '@/components/simulados/QuestaoEditor/types'
import type { AlternativaResponse, QuestaoResponse, SimuladoQuestaoResponse } from '@/types/simulados'

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

/** Vínculos ativos (não removidos) de um simulado, na ordem de montagem. */
function vinculosAtivosDoSimulado(vinculos: SimuladoQuestaoResponse[], simuladoId: number | null) {
  return vinculos
    .filter((vinculo) => vinculo.simuladoId === simuladoId && vinculo.status !== 'REMOVIDA')
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
}

/** Questões já salvas do simulado, com ids preservados para atualizar no lugar. */
export function questoesDoSimulado(
  vinculos: SimuladoQuestaoResponse[],
  bancoQuestoes: QuestaoResponse[],
  bancoAlternativas: AlternativaResponse[],
  simuladoId: number | null,
): QuestaoEditavel[] {
  return vinculosAtivosDoSimulado(vinculos, simuladoId)
    .map((vinculo) => bancoQuestoes.find((item) => item.id === vinculo.questaoId))
    .filter((item): item is QuestaoResponse => Boolean(item))
    .map((original) => carregarQuestao(original, bancoAlternativas))
}

/** Questão ATIVA ainda PENDENTE: o simulado só pode ser mexido na tela de aprovação. */
export function simuladoTemQuestaoPendente(
  vinculos: SimuladoQuestaoResponse[],
  bancoQuestoes: QuestaoResponse[],
  simuladoId: number | null,
): boolean {
  const porId = new Map(bancoQuestoes.map((questao) => [questao.id, questao]))

  return vinculosAtivosDoSimulado(vinculos, simuladoId).some(
    (vinculo) => porId.get(vinculo.questaoId)?.status === 'PENDENTE',
  )
}

export interface ResultadoDaImportacao {
  /** Lista final do formulário; null quando não coube nenhuma questão. */
  questoes: QuestaoEditavel[] | null
  importadas: number
  /** Escolhidas que não couberam no limite de questões. */
  cortadas: number
}

/**
 * Acrescenta questões do banco à lista atual, respeitando o limite. A primeira
 * questão em branco do formulário novo é descartada para dar lugar às importadas.
 */
export function planejarImportacaoDeQuestoes(
  atuais: QuestaoEditavel[],
  escolhidas: QuestaoResponse[],
  bancoAlternativas: AlternativaResponse[],
  disciplinaId: number | null,
): ResultadoDaImportacao {
  const primeiraVaziaAntes = atuais.length === 1 && !atuais[0].enunciado.trim() && !atuais[0].id
  const espacoDisponivel = MAXIMO_QUESTOES - (primeiraVaziaAntes ? 0 : atuais.length)
  const aceitas = escolhidas.slice(0, Math.max(0, espacoDisponivel))

  if (aceitas.length === 0) return { questoes: null, importadas: 0, cortadas: escolhidas.length }

  const importadas = aceitas.map((escolhida) => copiarQuestao(escolhida, bancoAlternativas, disciplinaId))

  return {
    questoes: primeiraVaziaAntes ? importadas : [...atuais, ...importadas],
    importadas: importadas.length,
    cortadas: escolhidas.length - aceitas.length,
  }
}
