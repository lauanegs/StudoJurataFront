import type { AlunoTurma } from '@/dominios/turmas/types'

import type { QuestaoResponse } from '@/dominios/simulados/types'

import type { SelectOption } from '@/components/ui/Select'
import type { FormularioSimulado } from '@/dominios/simulados/formulario'

import type { ErrosQuestao, QuestaoEditavel } from '@/components/simulados/QuestaoEditor/types'

export interface AbaQuestoesProps {
  questoes: QuestaoEditavel[]
  questaoAtiva: number
  errosQuestoes: Record<number, ErrosQuestao>
  somenteLeitura: boolean
  /** Disciplina do simulado: padrão para filtrar os conteúdos de uma questão sem disciplina própria. */
  disciplinaId: number | null
  onSelecionar: (indice: number) => void
  onAlterar: (indice: number, questao: QuestaoEditavel) => void
  onAdicionar: () => void
  onRemover: (indice: number) => void
  onImportar: () => void
}

export interface ConfiguracaoSimuladoProps {
  form: FormularioSimulado
  somenteLeitura: boolean
  podeEstenderDisponibilidade: boolean
  opcoesDisciplinas: SelectOption<number>[]
  opcoesTurmas: SelectOption<number>[]
  opcoesPlanos: SelectOption<number>[]
  carregandoDisciplinas: boolean
  carregandoTurmas: boolean
  carregandoPlanos: boolean
  alunosSelecionados: { id: number; nome: string }[]
  onSelecionarAlunos: () => void
  onRemoverAluno: (alunoId: number) => void
  /** Trocar de turma invalida os alunos já escolhidos. */
  onTrocarTurma: () => void
}

export interface ModalImportarQuestoesProps {
  aberto: boolean
  onClose: () => void
  opcoesDisciplinas: SelectOption<number>[]
  bancoQuestoes: QuestaoResponse[]
  carregando: boolean
  idsJaNoSimulado: Set<number>
  /** Retorna false quando nada pôde ser importado, mantendo a seleção. */
  onImportar: (escolhidas: QuestaoResponse[]) => boolean
}

export interface ModalImportarSimuladoProps {
  aberto: boolean
  onClose: () => void
  /** Simulado em edição, que não aparece na lista. */
  simuladoId: number | null
  opcoesTurmas: SelectOption<number>[]
  opcoesDisciplinas: SelectOption<number>[]
  carregandoBanco: boolean
  /** Ids das questões do simulado de origem, na ordem do vínculo. */
  onImportar: (questaoIds: number[]) => void
}

export interface ModalSelecionarAlunosProps {
  aberto: boolean
  onClose: () => void
  matriculas: AlunoTurma[]
  carregando: boolean
  vazio: boolean
  selecionados: number[]
  onChange: (selecionados: number[]) => void
}

/**
 * Criação e edição de simulado.
 *
 * O back modela isso em três entidades: Simulado, Questao (+ Alternativa) e
 * SimuladoQuestao. A tela junta tudo em um fluxo só e, ao salvar, executa a
 * sequência: cria/atualiza o Simulado → cria cada Questao com suas
 * Alternativas → liga tudo via SimuladoQuestao.
 *
 * Edição só é permitida enquanto o simulado está em RASCUNHO — depois de
 * lançado existem tentativas de alunos apontando para as questões.
 */
export type Aba = 'configuracao' | 'questoes'
