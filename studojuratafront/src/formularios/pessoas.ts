import { isValidCep, isValidCpf, isValidEmail, isValidPhone, parseCep, parsePhone } from '@brazilian-utils/brazilian-utils'
import { schemaResolver, useForm } from '@mantine/form'
import * as yup from 'yup'

import { formatarCpf } from '../utils/format'
import type { TipoUsuario } from '../types/comum'
import type { Pessoa, Sexo } from '../types/pessoas'

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

const opcional = (validar: (valor: string) => boolean) => (valor?: string) => !valor || validar(valor)

export const pessoaSchema = yup.object({
  nome: yup.string().trim().required('Informe o nome completo').min(3, 'O nome deve ter ao menos 3 caracteres'),
  cpf: yup.string().trim().required('Informe o CPF').test('cpf', 'CPF inválido', opcional(isValidCpf)),
  dataNascimento: yup
    .string()
    .test('data-valida', 'Data inválida', opcional((valor) => !Number.isNaN(new Date(`${valor}T00:00:00`).getTime())))
    .test('nao-futura', 'A data de nascimento não pode ser futura', opcional((valor) => new Date(`${valor}T00:00:00`).getTime() <= Date.now())),
  telefone: yup.string().test('telefone', 'Telefone inválido', opcional(isValidPhone)),
  email: yup.string().trim().test('email', 'E-mail inválido', opcional(isValidEmail)),
  cep: yup.string().test('cep', 'CEP incompleto', opcional(isValidCep)),
})

export function useFormularioPessoa() {
  return useForm<DadosPessoa>({
    initialValues: PESSOA_VAZIA,
    validate: schemaResolver(pessoaSchema),
    validateInputOnBlur: true,
  })
}

export type FormularioPessoa = ReturnType<typeof useFormularioPessoa>

const CAMPOS_ENDERECO = new Set<keyof DadosPessoa>(['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado'])

/** Aba em que o campo aparece, para levar o usuário até o erro em vez de só avisar por toast. */
export function abaDoCampoPessoa(campo: string): 'dados' | 'endereco' {
  return CAMPOS_ENDERECO.has(campo as keyof DadosPessoa) ? 'endereco' : 'dados'
}

export function paraPayloadPessoa(valores: DadosPessoa): Partial<Pessoa> {
  const enderecoPreenchido = [valores.cep, valores.logradouro, valores.numero, valores.complemento, valores.bairro, valores.cidade, valores.estado].some(Boolean)

  return {
    nome: valores.nome.trim(),
    // O back guarda o CPF com máscara (length = 14).
    cpf: formatarCpf(valores.cpf),
    dataNascimento: valores.dataNascimento || undefined,
    telefone: valores.telefone ? parsePhone(valores.telefone) : undefined,
    email: valores.email.trim() || undefined,
    sexo: valores.sexo ?? undefined,
    status: 'ATIVO',
    endereco: enderecoPreenchido
      ? {
          cep: valores.cep ? parseCep(valores.cep) : undefined,
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

export interface DadosUsuario {
  pessoaId: number | null
  tipoUsuario: TipoUsuario | null
  username: string
  senha: string
  ativo: boolean
}

/** Na edição a senha é opcional: em branco mantém a atual. */
export function useFormularioUsuario(edicao: boolean) {
  return useForm<DadosUsuario>({
    initialValues: { pessoaId: null, tipoUsuario: null, username: '', senha: '', ativo: true },
    validate: schemaResolver(
      yup.object({
        pessoaId: yup.number().nullable().required('Selecione a pessoa'),
        tipoUsuario: yup.string().nullable().required('Selecione o tipo de usuário'),
        username: yup.string().trim().required('Informe o usuário'),
        senha: edicao ? yup.string() : yup.string().trim().required('Informe a senha'),
      }),
    ),
    validateInputOnBlur: true,
  })
}
