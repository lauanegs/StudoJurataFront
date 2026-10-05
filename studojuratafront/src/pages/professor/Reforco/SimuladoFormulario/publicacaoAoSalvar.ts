import type { TipoDestinacaoSimulado } from '../../../../types/simulados'

export type AcaoAoSalvar = 'lancar-agora' | 'publicacao-automatica' | 'rascunho'

export interface PlanoDePublicacao {
  acao: AcaoAoSalvar
  /** A data de início já passou (a disponibilidade já começou). */
  inicioJaChegou: boolean
}

/**
 * O que acontece com o simulado depois de salvo, conforme as datas e a destinação.
 *
 * - Janela vencida: nunca lança; fica rascunho.
 * - Alunos específicos só são conhecidos agora, então são lançados já (os alunos o
 *   iniciam a partir da data de início).
 * - Turma toda: início já chegou lança agora; início futuro fica em rascunho e o
 *   sistema o publica sozinho quando a data chegar.
 */
export function planejarPublicacao(params: {
  tipoDestinacao: TipoDestinacaoSimulado
  quantidadeAlunosEscolhidos: number
  dataInicio: string
  dataFim?: string | null
  agora?: number
}): PlanoDePublicacao {
  const { tipoDestinacao, quantidadeAlunosEscolhidos, dataInicio, dataFim, agora = Date.now() } = params

  const inicioJaChegou = new Date(dataInicio).getTime() <= agora
  const janelaVencida = Boolean(dataFim) && new Date(dataFim as string).getTime() <= agora
  const especificoComAlunos = tipoDestinacao === 'ESPECIFICO' && quantidadeAlunosEscolhidos > 0

  if (janelaVencida) return { acao: 'rascunho', inicioJaChegou }

  if (inicioJaChegou ? tipoDestinacao === 'TODOS' || especificoComAlunos : especificoComAlunos) {
    return { acao: 'lancar-agora', inicioJaChegou }
  }

  return { acao: tipoDestinacao === 'TODOS' ? 'publicacao-automatica' : 'rascunho', inicioJaChegou }
}
