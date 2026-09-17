import { apenasDigitos, cpfValido, email } from '../../../utils/validacao'
import type { Pessoa } from '../../../types'
import type { DadosPessoa } from './dadosPessoa'

/** Valida o bloco de dados pessoais espelhando as constraints do back. */
export function validarPessoa(valores: DadosPessoa): Partial<Record<keyof DadosPessoa, string>> {
  const erros: Partial<Record<keyof DadosPessoa, string>> = {}

  if (!valores.nome.trim()) {
    erros.nome = 'Informe o nome completo'
  } else if (valores.nome.trim().length < 3) {
    erros.nome = 'O nome deve ter ao menos 3 caracteres'
  }

  // Pessoa.cpf é @Column(unique = true, nullable = false, length = 14).
  if (!valores.cpf.trim()) {
    erros.cpf = 'Informe o CPF'
  } else if (!cpfValido(valores.cpf)) {
    erros.cpf = 'CPF inválido'
  }

  if (valores.dataNascimento) {
    const data = new Date(`${valores.dataNascimento}T00:00:00`)
    if (Number.isNaN(data.getTime())) {
      erros.dataNascimento = 'Data inválida'
    } else if (data.getTime() > Date.now()) {
      erros.dataNascimento = 'A data de nascimento não pode ser futura'
    }
  }

  if (valores.telefone) {
    const digitos = apenasDigitos(valores.telefone)
    if (digitos.length !== 10 && digitos.length !== 11) {
      erros.telefone = 'Telefone incompleto'
    }
  }

  const erroEmail = email(valores.email)
  if (erroEmail) erros.email = erroEmail

  // Endereço é todo opcional: só valida o formato do que foi preenchido.
  if (valores.cep && apenasDigitos(valores.cep).length !== 8) {
    erros.cep = 'CEP incompleto'
  }

  return erros
}

const CAMPOS_ENDERECO = new Set<keyof DadosPessoa>([
  'cep',
  'logradouro',
  'numero',
  'complemento',
  'bairro',
  'cidade',
  'estado',
])

/** Em qual aba (dados/endereço) um campo de DadosPessoa aparece — usado para levar
 * o usuário até a aba com erro, em vez de só um toast genérico "faltam campos". */
export function abaDoCampoPessoa(campo: keyof DadosPessoa): 'dados' | 'endereco' {
  return CAMPOS_ENDERECO.has(campo) ? 'endereco' : 'dados'
}

export function paraPayloadPessoa(valores: DadosPessoa): Partial<Pessoa> {
  // Só envia o endereço se algum campo foi preenchido, para não gravar um Endereco vazio.
  const enderecoPreenchido =
    valores.cep || valores.logradouro || valores.numero || valores.complemento ||
    valores.bairro || valores.cidade || valores.estado

  return {
    nome: valores.nome.trim(),
    cpf: formatarCpfParaEnvio(valores.cpf),
    dataNascimento: valores.dataNascimento || undefined,
    telefone: valores.telefone ? apenasDigitos(valores.telefone) : undefined,
    email: valores.email.trim() || undefined,
    sexo: valores.sexo ?? undefined,
    status: 'ATIVO',
    endereco: enderecoPreenchido
      ? {
          cep: valores.cep ? apenasDigitos(valores.cep) : undefined,
          logradouro: valores.logradouro.trim() || undefined,
          numero: valores.numero.trim() || undefined,
          complemento: valores.complemento.trim() || undefined,
          bairro: valores.bairro.trim() || undefined,
          cidade: valores.cidade.trim() || undefined,
          estado: valores.estado || undefined,
        }
      : undefined,
  }
}

/** O back guarda o CPF com máscara (length = 14). */
function formatarCpfParaEnvio(cpf: string): string {
  const digitos = apenasDigitos(cpf)

  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function dePessoa(pessoa: Pessoa): DadosPessoa {
  return {
    nome: pessoa.nome ?? '',
    cpf: pessoa.cpf ?? '',
    dataNascimento: pessoa.dataNascimento?.slice(0, 10) ?? '',
    telefone: pessoa.telefone ?? '',
    email: pessoa.email ?? '',
    sexo: pessoa.sexo ?? null,
    cep: pessoa.endereco?.cep ?? '',
    logradouro: pessoa.endereco?.logradouro ?? '',
    numero: pessoa.endereco?.numero ?? '',
    complemento: pessoa.endereco?.complemento ?? '',
    bairro: pessoa.endereco?.bairro ?? '',
    cidade: pessoa.endereco?.cidade ?? '',
    estado: pessoa.endereco?.estado ?? '',
  }
}
