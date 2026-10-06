import type { QuestaoAlunoResponse, SimuladoAlunoResponse, SimuladoResponse } from '@/dominios/simulados/types'

import type { AlternativaResponse, TipoQuestao } from '@/dominios/simulados/types'

export interface QuestaoDaProva {
  questaoId: number
  enunciado: string
  tipo: TipoQuestao
  alternativas: AlternativaResponse[]
}

export interface ResultadoDoSimuladoProps {
  tentativa?: SimuladoAlunoResponse | null
  simulado?: SimuladoResponse | null
  questoes: QuestaoDaProva[]
  respostas: QuestaoAlunoResponse[]
  nomeDoAluno?: string | null
  imagemSkin: string
  diasProximaRevisao: number | null
  aoVoltar: () => void
}

export interface MensagemResultado {
  titulo: string
  descricao: string
}

export type RespostasAlternativa = Record<number, number | null>

export type RespostasVerdadeiroFalso = Record<number, Record<number, boolean>>
