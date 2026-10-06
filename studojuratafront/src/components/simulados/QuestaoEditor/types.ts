import type { NivelDificuldade, StatusQuestao, TipoQuestao } from '@/dominios/simulados/types'

export interface AlternativaEditavel {
  id?: number
  texto: string
  correta: boolean
}

export interface QuestaoEditavel {
  id?: number
  enunciado: string
  tipo: TipoQuestao
  disciplinaId?: number | null
  nivelDificuldade?: NivelDificuldade | null
  status?: StatusQuestao
  alternativas: AlternativaEditavel[]
  conteudoPlanoIdsPendentes?: number[]
}

export interface ErrosQuestao {
  enunciado?: string
  alternativas?: string
  conteudo?: string
}

export interface QuestaoEditorProps {
  questao: QuestaoEditavel
  onChange: (questao: QuestaoEditavel) => void
  indice: number
  total: number
  somenteLeitura?: boolean
  erros?: ErrosQuestao
  onRemove?: () => void
  onImport?: () => void
  actions?: React.ReactNode
  navegador?: React.ReactNode
  conteudo?: React.ReactNode
}

export const MAXIMO_ALTERNATIVAS = 3
export const MINIMO_ALTERNATIVAS = 2

export function afirmacoesVerdadeiroFalso(): AlternativaEditavel[] {
  return [
    { texto: '', correta: false },
    { texto: '', correta: false },
    { texto: '', correta: false },
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
    erros.alternativas =
      questao.tipo === 'VERDADEIRO_FALSO'
        ? `Informe ao menos ${MINIMO_ALTERNATIVAS} afirmações`
        : `Informe ao menos ${MINIMO_ALTERNATIVAS} alternativas`
  } else if (!questao.alternativas.some((alternativa) => alternativa.correta && alternativa.texto.trim())) {
    erros.alternativas =
      questao.tipo === 'VERDADEIRO_FALSO'
        ? 'Marque ao menos uma afirmação como Verdadeira'
        : 'Marque qual alternativa é a correta'
  }

  if (!questao.id && (questao.conteudoPlanoIdsPendentes?.length ?? 0) === 0) {
    erros.conteudo = 'Vincule ao menos um conteúdo já ministrado (com aula realizada)'
  }

  return erros
}
