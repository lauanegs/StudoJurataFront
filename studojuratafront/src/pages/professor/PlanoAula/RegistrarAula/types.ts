export type Aba = 'chamada' | 'conteudo'

export interface LinhaChamada {
  alunoId: number
  nome: string
  presente: boolean
  justificativa: string
}
