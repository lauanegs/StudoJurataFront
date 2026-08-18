import type { Sexo } from '../../../types'

export interface DadosPessoa {
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  email: string
  sexo: Sexo | null
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

export const PESSOA_VAZIA: DadosPessoa = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  email: '',
  sexo: null,
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
}
