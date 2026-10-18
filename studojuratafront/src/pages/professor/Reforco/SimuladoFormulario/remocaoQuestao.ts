import type { ParametrosRemocaoQuestao, ResultadoRemocaoQuestao } from './types'

/** Remove a questão da lista do formulário do simulado */
export async function removerQuestaoDoSimulado<T extends { id?: number }>({
  questoes,
  indice,
  simuladoId,
  desvincular,
}: ParametrosRemocaoQuestao<T>): Promise<ResultadoRemocaoQuestao<T>> {
  const questao = questoes[indice]
  if (!questao) {
    return { questoes }
  }

  if (questao.id != null && simuladoId != null) {
    try {
      await desvincular(simuladoId, questao.id)
    } catch (erro) {
      return { questoes, erro: erro instanceof Error ? erro : new Error('Erro ao remover a questão') }
    }
  }

  return { questoes: questoes.filter((_, posicao) => posicao !== indice) }
}
