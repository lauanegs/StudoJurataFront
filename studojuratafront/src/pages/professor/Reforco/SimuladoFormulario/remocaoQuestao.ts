/**
 * Remove a questão da lista do formulário do simulado.
 *
 * <p>Questão já vinculada ao simulado sai do back primeiro
 * (`DELETE /simulado-questao/simulado/{id}/questao/{id}`): se a API falhar, a
 * lista não muda e o erro sobe para a tela — a questão continua visível.
 * Questão nova (sem id) ou formulário de criação existe só no rascunho local,
 * então sai direto da lista.
 */
export async function removerQuestaoDoSimulado<T extends { id?: number }>({
  questoes,
  indice,
  simuladoId,
  desvincular,
}: {
  questoes: T[]
  indice: number
  simuladoId: number | null
  desvincular: (simuladoId: number, questaoId: number) => Promise<void>
}): Promise<{ questoes: T[]; erro?: unknown }> {
  const questao = questoes[indice]
  if (!questao) {
    return { questoes }
  }

  if (questao.id != null && simuladoId != null) {
    try {
      await desvincular(simuladoId, questao.id)
    } catch (erro) {
      return { questoes, erro }
    }
  }

  return { questoes: questoes.filter((_, posicao) => posicao !== indice) }
}
