import type { NivelDificuldade, StatusQuestao, TipoQuestao } from '../../../types'
import type { SelectOption } from '../Select/types'

export interface AlternativaEditavel {
  /** Presente quando a alternativa já existe no back. */
  id?: number
  texto: string
  correta: boolean
}

export interface QuestaoEditavel {
  /** Presente quando a questão já existe no back. */
  id?: number
  enunciado: string
  tipo: TipoQuestao
  disciplinaId?: number | null
  nivelDificuldade?: NivelDificuldade | null
  status?: StatusQuestao
  alternativas: AlternativaEditavel[]
}

export interface ErrosQuestao {
  enunciado?: string
  alternativas?: string
  disciplinaId?: string
}

export interface QuestaoEditorProps {
  questao: QuestaoEditavel
  onChange: (questao: QuestaoEditavel) => void
  indice: number
  total: number
  disciplinas: SelectOption<number>[]
  carregandoDisciplinas?: boolean
  /** Modo leitura: usado na revisão até o professor clicar em "Editar". */
  somenteLeitura?: boolean
  erros?: ErrosQuestao
  onRemove?: () => void
  onImport?: () => void
  /** Slot de ações extras no cabeçalho (aprovar/reprovar na revisão). */
  actions?: React.ReactNode
}

export const MAXIMO_ALTERNATIVAS = 5
export const MINIMO_ALTERNATIVAS = 2

export function alternativasVerdadeiroFalso(corretaIndice = 0): AlternativaEditavel[] {
  return [
    { texto: 'Verdadeiro', correta: corretaIndice === 0 },
    { texto: 'Falso', correta: corretaIndice === 1 },
  ]
}

export function questaoVazia(): QuestaoEditavel {
  return {
    enunciado: '',
    tipo: 'ALTERNATIVAS',
    disciplinaId: null,
    nivelDificuldade: 'MEDIA',
    alternativas: [
      { texto: '', correta: true },
      { texto: '', correta: false },
      { texto: '', correta: false },
    ],
  }
}

export function validarQuestao(questao: QuestaoEditavel): ErrosQuestao {
  const erros: ErrosQuestao = {}

  if (!questao.enunciado.trim()) {
    erros.enunciado = 'Escreva o enunciado da questão'
  }

  const preenchidas = questao.alternativas.filter((alternativa) => alternativa.texto.trim())

  if (preenchidas.length < MINIMO_ALTERNATIVAS) {
    erros.alternativas = `Informe ao menos ${MINIMO_ALTERNATIVAS} alternativas`
  } else if (!questao.alternativas.some((alternativa) => alternativa.correta && alternativa.texto.trim())) {
    erros.alternativas = 'Marque qual alternativa é a correta'
  }

  return erros
}
