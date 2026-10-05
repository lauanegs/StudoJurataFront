export type TipoFiltro = 'disciplina' | 'aluno'

export type Visao = 'ativos' | 'historico'

export interface FiltroAplicado {
  turmaId: number
  tipo: TipoFiltro
  especificoId: number
}

export interface LinhaAcordeao {
  chave: string
  titulo: string
  alunoId: number
  disciplinaId: number
  turmaId: number
}
