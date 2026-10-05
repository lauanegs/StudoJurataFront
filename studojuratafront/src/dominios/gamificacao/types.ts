import type { EntidadeBase } from '@/dominios/comum/types'
import type { Aluno } from '@/dominios/pessoas/types'

export interface PontuacaoAluno extends EntidadeBase {
  aluno: Aluno
  moedas: number
}

export interface Skin extends EntidadeBase {
  nome: string
  descricao?: string
  custoMoedas: number
  urlAsset?: string
  disponivel: boolean
}

export interface SkinAluno extends EntidadeBase {
  aluno: Aluno
  skin: Skin
  dataAquisicao?: string
  ativa: boolean
}
