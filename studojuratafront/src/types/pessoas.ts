import type { EntidadeBase, StatusAtivoInativo, TipoUsuario } from './comum'
import type { Escola } from './curriculo'

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
  /** UF, 2 letras. */
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
  aceitouTermos?: boolean
  dataAceite?: string
  textoVersao?: string
}

export interface Usuario extends EntidadeBase {
  escola: Escola
  pessoa: Pessoa
  username: string
  /** Só de escrita: o back nunca devolve a senha (@JsonProperty WRITE_ONLY). */
  senha?: string
  tipoUsuario: TipoUsuario
  status?: StatusAtivoInativo
  aluno?: Aluno | null
  professor?: Professor | null
}
