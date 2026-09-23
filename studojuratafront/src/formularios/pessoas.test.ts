import { describe, expect, it } from 'vitest'

import { abaDoCampoPessoa, dePessoa, paraPayloadPessoa, pessoaSchema, PESSOA_VAZIA } from './pessoas'
import { errosDoSchema } from './errosDoSchema.test-utils'
import type { Pessoa } from '../types/pessoas'

const VALIDA = { ...PESSOA_VAZIA, nome: 'Rafael Torres Mendes', cpf: '800.000.001-67', sexo: 'FEMININO' as const }

describe('pessoaSchema', () => {
  const schema = pessoaSchema()

  it('aceita cadastro com nome, CPF e sexo válidos', async () => {
    expect(await errosDoSchema(schema, VALIDA)).toEqual({})
  })

  it('exige nome, CPF e sexo', async () => {
    expect(await errosDoSchema(schema, PESSOA_VAZIA)).toEqual({
      nome: 'Informe o nome completo',
      cpf: 'Informe o CPF',
      sexo: 'Selecione o sexo',
    })
  })

  it('rejeita nome curto e CPF com dígito verificador errado', async () => {
    expect(await errosDoSchema(schema, { ...VALIDA, nome: 'Al', cpf: '123.456.789-00' })).toEqual({
      nome: 'O nome deve ter ao menos 3 caracteres',
      cpf: 'CPF inválido',
    })
  })

  it('valida os campos opcionais só quando preenchidos', async () => {
    const erros = await errosDoSchema(schema, {
      ...VALIDA,
      telefone: '(34) 99',
      email: 'sem-arroba',
      cep: '38700',
      dataNascimento: '2999-01-01',
    })

    expect(erros).toEqual({
      telefone: 'Telefone inválido',
      email: 'E-mail inválido',
      cep: 'CEP incompleto',
      dataNascimento: 'A data de nascimento não pode ser futura',
    })
  })

  it('aceita telefone, e-mail e CEP válidos', async () => {
    const dados = { ...VALIDA, telefone: '(11) 98100-0001', email: 'rafael@escola.com', cep: '01310-100' }
    expect(await errosDoSchema(schema, dados)).toEqual({})
  })

  it('no cadastro de aluno a data de nascimento passa a ser obrigatória', async () => {
    const schemaDoAluno = pessoaSchema({ exigirDataNascimento: true })

    expect(await errosDoSchema(schemaDoAluno, VALIDA)).toEqual({
      dataNascimento: 'Informe a data de nascimento',
    })
    expect(await errosDoSchema(schemaDoAluno, { ...VALIDA, dataNascimento: '2015-05-20' })).toEqual({})
  })
})

describe('abaDoCampoPessoa', () => {
  it('leva campos de endereço para a aba de endereço', () => {
    expect(abaDoCampoPessoa('cep')).toBe('endereco')
    expect(abaDoCampoPessoa('estado')).toBe('endereco')
    expect(abaDoCampoPessoa('cpf')).toBe('dados')
  })
})

describe('paraPayloadPessoa', () => {
  it('mantém a máscara do CPF e envia telefone e CEP só com dígitos', () => {
    const payload = paraPayloadPessoa({
      ...VALIDA,
      cpf: '80000000167',
      telefone: '(11) 98100-0001',
      cep: '01310-100',
      logradouro: ' Avenida Paulista ',
    })

    expect(payload.cpf).toBe('800.000.001-67')
    expect(payload.telefone).toBe('11981000001')
    expect(payload.endereco).toMatchObject({ cep: '01310100', logradouro: 'Avenida Paulista' })
  })

  it('não envia endereço vazio nem campos opcionais em branco', () => {
    const payload = paraPayloadPessoa(VALIDA)

    expect(payload.endereco).toBeUndefined()
    expect(payload.telefone).toBeUndefined()
    expect(payload.email).toBeUndefined()
    expect(payload.status).toBe('ATIVO')
  })
})

describe('dePessoa', () => {
  it('converte a pessoa do back para os campos do formulário', () => {
    const pessoa = {
      id: 1,
      nome: 'Enzo Ferreira Lima',
      cpf: '700.000.001-59',
      dataNascimento: '2019-03-14T00:00:00',
      endereco: { cep: '01310100', cidade: 'São Paulo' },
    } as Pessoa

    expect(dePessoa(pessoa)).toEqual({
      ...PESSOA_VAZIA,
      nome: 'Enzo Ferreira Lima',
      cpf: '700.000.001-59',
      dataNascimento: '2019-03-14',
      cep: '01310100',
      cidade: 'São Paulo',
    })
  })
})
