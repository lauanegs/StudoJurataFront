import type { alternativas as servicoAlternativas, questoes as servicoQuestoes, simuladoQuestoes } from '@/dominios/simulados/service'

import type { AlunoTurma } from '@/dominios/turmas/types'

import type { QuestaoResponse } from '@/dominios/simulados/types'

import type { SelectOption } from '@/components/ui/Select'
import type { FormularioSimulado } from '@/dominios/simulados/types'
import type { ErrosQuestao, QuestaoEditavel } from '@/components/simulados/QuestaoEditor/types'

export interface AbaQuestoesProps {
  questoes: QuestaoEditavel[]
  questaoAtiva: number
  errosQuestoes: Record<number, ErrosQuestao>
  somenteLeitura: boolean
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
  onTrocarTurma: () => void
}

export interface ModalImportarQuestoesProps {
  aberto: boolean
  onClose: () => void
  opcoesDisciplinas: SelectOption<number>[]
  bancoQuestoes: QuestaoResponse[]
  carregando: boolean
  idsJaNoSimulado: Set<number>
  onImportar: (escolhidas: QuestaoResponse[]) => boolean
}

export interface ModalImportarSimuladoProps {
  aberto: boolean
  onClose: () => void
  simuladoId: number | null
  opcoesTurmas: SelectOption<number>[]
  opcoesDisciplinas: SelectOption<number>[]
  carregandoBanco: boolean
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

export type Aba = 'configuracao' | 'questoes'

export interface OpcaoDisciplina {
  value: number
  label: string
}

export interface ApiDasQuestoes {
  criarQuestao: typeof servicoQuestoes.criar
  atualizarQuestao: typeof servicoQuestoes.atualizar
  vincularConteudo: typeof servicoQuestoes.vincularConteudo
  criarAlternativa: typeof servicoAlternativas.criar
  atualizarAlternativa: typeof servicoAlternativas.atualizar
  vincularAoSimulado: typeof simuladoQuestoes.criar
}

export type AcaoAoSalvar = 'lancar-agora' | 'publicacao-automatica' | 'rascunho'

export interface PlanoDePublicacao {
  acao: AcaoAoSalvar
  inicioJaChegou: boolean
}

export interface ResultadoDaImportacao {
  questoes: QuestaoEditavel[] | null
  importadas: number
  cortadas: number
}

export interface ParametrosRemocaoQuestao<T extends { id?: number }> {
  questoes: T[]
  indice: number
  simuladoId: number | null
  desvincular: (simuladoId: number, questaoId: number) => Promise<void>
}

export interface ResultadoRemocaoQuestao<T> {
  questoes: T[]
  erro?: Error
}
