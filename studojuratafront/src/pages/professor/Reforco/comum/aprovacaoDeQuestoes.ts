import type { QuestaoEditavel } from '@/components/simulados/QuestaoEditor/types'
import type { AlternativaResponse, QuestaoResponse, SimuladoQuestaoResponse } from '@/dominios/simulados/types'

/** Questões do simulado ainda PENDENTES de aprovação, por id, com as alternativas em ordem */
export function questoesPendentesDoSimulado(
  vinculos: SimuladoQuestaoResponse[],
  bancoQuestoes: QuestaoResponse[],
  bancoAlternativas: AlternativaResponse[],
  simuladoId: number,
): QuestaoEditavel[] {
  const idsDoSimulado = new Set(
    vinculos.filter((vinculo) => vinculo.simuladoId === simuladoId).map((vinculo) => vinculo.questaoId),
  )

  return bancoQuestoes
    .filter((questao) => idsDoSimulado.has(questao.id) && questao.status === 'PENDENTE')
    .sort((a, b) => a.id - b.id)
    .map((questao): QuestaoEditavel => ({
      id: questao.id,
      enunciado: questao.enunciado,
      tipo: questao.tipo,
      disciplinaId: questao.disciplinaId ?? null,
      nivelDificuldade: questao.nivelDificuldade ?? null,
      status: questao.status,
      alternativas: bancoAlternativas
        .filter((alternativa) => alternativa.questaoId === questao.id)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map((alternativa) => ({
          id: alternativa.id,
          texto: alternativa.texto,
          correta: Boolean(alternativa.correta),
        })),
    }))
}
