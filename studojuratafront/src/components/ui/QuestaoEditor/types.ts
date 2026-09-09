import type { NivelDificuldade, StatusQuestao, TipoQuestao } from '../../../types'

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
  /**
   * Conteúdos escolhidos ANTES de a questão existir (sem `id` ainda) — mesmo
   * princípio de `alternativas` acima: fica só no estado local até o
   * formulário salvar, quando aí sim vira vínculo de verdade via API (ver
   * SimuladoFormulario.salvar()). Ignorado assim que `id` existe — a partir
   * daí o vínculo já é comitado na hora (VinculoConteudoQuestao muda pro
   * modo "ao vivo").
   */
  conteudoPlanoIdsPendentes?: number[]
}

export interface ErrosQuestao {
  enunciado?: string
  alternativas?: string
}

export interface QuestaoEditorProps {
  questao: QuestaoEditavel
  onChange: (questao: QuestaoEditavel) => void
  indice: number
  total: number
  /** Modo leitura: usado na revisão até o professor clicar em "Editar". */
  somenteLeitura?: boolean
  erros?: ErrosQuestao
  onRemove?: () => void
  onImport?: () => void
  /** Slot de ações extras no cabeçalho (aprovar/reprovar na revisão). */
  actions?: React.ReactNode
  /** Navegação entre questões (números + "Nova questão") — fica dentro do mesmo card, não separada. Só o formulário de simulado (várias questões) usa. */
  navegador?: React.ReactNode
  /** Vínculo com conteúdo(s) do plano de ensino (VinculoConteudoQuestao) — fica dentro do mesmo card, mesmo padrão do navegador. */
  conteudo?: React.ReactNode
}

// Confirmado com o usuário: a tela de simulado do aluno segue o layout do
// Figma com até 3 alternativas por questão — o cadastro trava nesse mesmo
// limite pra nenhuma questão nova sair maior do que a tela comporta.
export const MAXIMO_ALTERNATIVAS = 3
export const MINIMO_ALTERNATIVAS = 2

/**
 * Confirmado no Figma ("novo simulado — tipo questão v/f"): uma questão V/F
 * é uma lista de afirmações — cada uma julgada Verdadeira ou Falsa de forma
 * independente (não é "só uma está certa" como em Alternativas). O back
 * relaxa a regra de "no máximo uma correta" especificamente pra esse tipo
 * (AlternativaService.validarCorretaUnica), então várias `correta: true` na
 * mesma questão são esperadas aqui.
 */
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

  return erros
}
