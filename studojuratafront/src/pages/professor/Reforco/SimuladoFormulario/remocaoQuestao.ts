/** Remove a questão da lista do formulário do simulado */
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
