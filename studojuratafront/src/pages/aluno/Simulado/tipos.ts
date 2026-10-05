import type { AlternativaResponse, TipoQuestao } from '../../../types/simulados'

/** Questão da prova no formato que a tela usa (`correta` vem do gabarito, que só existe após conferir ou finalizar). */
export interface QuestaoDaProva {
  questaoId: number
  enunciado: string
  tipo: TipoQuestao
  alternativas: AlternativaResponse[]
}
