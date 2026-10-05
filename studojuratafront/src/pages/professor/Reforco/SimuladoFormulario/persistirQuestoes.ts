import {
  alternativas as servicoAlternativas,
  questoes as servicoQuestoes,
  simuladoQuestoes,
} from '@/dominios/simulados/service'
import type { QuestaoEditavel } from '@/components/simulados/QuestaoEditor/types'

/** Chamadas ao back usadas ao salvar as questões; injetáveis para testar a ordem sem rede. */
export interface ApiDasQuestoes {
  criarQuestao: typeof servicoQuestoes.criar
  atualizarQuestao: typeof servicoQuestoes.atualizar
  vincularConteudo: typeof servicoQuestoes.vincularConteudo
  criarAlternativa: typeof servicoAlternativas.criar
  atualizarAlternativa: typeof servicoAlternativas.atualizar
  vincularAoSimulado: typeof simuladoQuestoes.criar
}

const apiReal: ApiDasQuestoes = {
  criarQuestao: servicoQuestoes.criar,
  atualizarQuestao: servicoQuestoes.atualizar,
  vincularConteudo: servicoQuestoes.vincularConteudo,
  criarAlternativa: servicoAlternativas.criar,
  atualizarAlternativa: servicoAlternativas.atualizar,
  vincularAoSimulado: simuladoQuestoes.criar,
}

/**
 * Grava cada questão do formulário (cria ou atualiza), suas alternativas e,
 * para as questões novas, os conteúdos e o vínculo com o simulado.
 *
 * Na questão nova, os conteúdos vêm antes do vínculo com o simulado: o back só
 * aceita no simulado questão com conteúdo já ministrado.
 */
export async function salvarQuestoesDoSimulado(
  params: {
    simuladoId: number
    questoes: QuestaoEditavel[]
    disciplinaId: number | null
    notaMaxima: number | null
  },
  api: ApiDasQuestoes = apiReal,
) {
  const { simuladoId, questoes, disciplinaId, notaMaxima } = params

  const pontuacaoPorQuestao = notaMaxima ? Number((notaMaxima / questoes.length).toFixed(2)) : undefined

  for (const [indice, questao] of questoes.entries()) {
    const corpoQuestao = {
      enunciado: questao.enunciado.trim(),
      tipo: questao.tipo,
      disciplinaId: questao.disciplinaId ?? disciplinaId,
      nivelDificuldade: questao.nivelDificuldade,
      origem: 'PROFESSOR' as const,
    }
    const questaoSalva = questao.id
      ? await api.atualizarQuestao(questao.id, corpoQuestao)
      : await api.criarQuestao(corpoQuestao)

    for (const [posicao, alternativa] of questao.alternativas.entries()) {
      if (!alternativa.texto.trim()) continue

      const corpoAlternativa = {
        questaoId: questaoSalva.id,
        texto: alternativa.texto.trim(),
        correta: alternativa.correta,
        ordem: posicao + 1,
      }

      if (alternativa.id) {
        await api.atualizarAlternativa(alternativa.id, corpoAlternativa)
      } else {
        await api.criarAlternativa(corpoAlternativa)
      }
    }

    // Vincula a questão ao simulado só na primeira vez.
    if (!questao.id) {
      if (questao.conteudoPlanoIdsPendentes && questao.conteudoPlanoIdsPendentes.length > 0) {
        await Promise.all(
          questao.conteudoPlanoIdsPendentes.map((conteudoPlanoId) =>
            api.vincularConteudo(questaoSalva.id, conteudoPlanoId),
          ),
        )
      }

      await api.vincularAoSimulado({
        simuladoId,
        questaoId: questaoSalva.id,
        ordem: indice + 1,
        pontuacao: pontuacaoPorQuestao,
      })
    }
  }
}
