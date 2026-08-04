import type { Sexo } from '../../../types'

export interface DadosPessoa {
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  email: string
  sexo: Sexo | null
}

export const PESSOA_VAZIA: DadosPessoa = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  email: '',
  sexo: null,
}
