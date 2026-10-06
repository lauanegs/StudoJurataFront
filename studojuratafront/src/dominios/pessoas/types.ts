import type { useFormularioPessoa } from './formulario'

import type { EntidadeBase, StatusAtivoInativo, TipoUsuario } from '@/dominios/comum/types'
import type { Escola } from '@/dominios/curriculo/types'

export type Sexo = 'FEMININO' | 'MASCULINO'

export type Parentesco =
  | 'PAI'
  | 'MAE'
  | 'AVO'
  | 'AVOA'
  | 'TIO'
  | 'TIA'
  | 'IRMAO_IRMA'
  | 'TUTOR_LEGAL'
  | 'OUTRO'

export interface Endereco {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}

export interface Pessoa extends EntidadeBase {
  nome: string
  cpf: string
  dataNascimento?: string
  telefone?: string
  email?: string
  sexo?: Sexo
  status?: StatusAtivoInativo
  endereco?: Endereco | null
}

export interface Aluno extends EntidadeBase {
  pessoa: Pessoa
  matricula?: string
}

export interface Professor extends EntidadeBase {
  pessoa: Pessoa
  status?: StatusAtivoInativo
}

export interface Responsavel extends EntidadeBase {
  pessoa: Pessoa
}

export interface ResponsavelAluno extends EntidadeBase {
  responsavel: Responsavel
  aluno: Aluno
  parentesco: Parentesco
}

export interface Usuario extends EntidadeBase {
  escola: Escola
  pessoa: Pessoa
  username: string
  senha?: string
  tipoUsuario: TipoUsuario
  status?: StatusAtivoInativo
  aluno?: Aluno | null
  professor?: Professor | null
}

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

export interface OpcoesFormularioPessoa {
  exigirDataNascimento?: boolean
}

export type FormularioPessoa = ReturnType<typeof useFormularioPessoa>

export interface DadosUsuario {
  pessoaId: number | null
  tipoUsuario: TipoUsuario | null
  username: string
  senha: string
  ativo: boolean
}
