import type { MotivoRecomendacao } from '@/dominios/ia/types'

export type TipoFiltro = 'disciplina' | 'aluno'

export type Aba = 'aprovacao' | 'proximas'

export interface FiltroAplicado {
  turmaId: number
  tipo: TipoFiltro
  especificoId: number
}

export interface LinhaAprovacao {
  simuladoId: number
  titulo: string
  disciplinaRotulo: string
  alunoRotulo: string
  motivoRotulo: string
  dataCriacao?: string
  atrasoDias: number | null
}

export interface ProximaGeracaoIA {
  alunoId: number
  alunoNome: string
  conteudoPlanoId: number
  conteudoTitulo: string
  motivos: MotivoRecomendacao[]
  dataGeracaoPrevista: string
  taxaAcerto?: number
}
