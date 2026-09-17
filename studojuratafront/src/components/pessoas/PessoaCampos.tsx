import { useState } from 'react'
import styled from 'styled-components'
import { GetAddressInfoByCepNotFoundError, getAddressInfoByCep, isValidCep } from '@brazilian-utils/brazilian-utils'

import { DatePicker } from '../ui/DatePicker'
import { GradeAutoAjuste } from '../ui/GradeAutoAjuste'
import { Input } from '../ui/Input'
import { RadioGroup } from '../ui/RadioGroup'
import { Select } from '../ui/Select'
import { useToast } from '../../contexts/toastContexto'
import { formatarCep, formatarCpf, formatarTelefone } from '../../utils/format'
import { OPCOES_SEXO, OPCOES_UF } from '../../utils/labels'
import type { FormularioPessoa } from '../../formularios/pessoas'
import type { Sexo } from '../../types/pessoas'

const LinhaInteira = styled.div`
  grid-column: 1 / -1;
`

interface PessoaCamposProps {
  form: FormularioPessoa
  disabled?: boolean
  rotuloNome?: string
  secao?: 'dados' | 'endereco'
}

/** Bloco de dados pessoais compartilhado por Aluno, Professor e Responsável (todos estendem Pessoa no back). */
export function PessoaCampos({ form, disabled, rotuloNome = 'Nome completo', secao = 'dados' }: PessoaCamposProps) {
  const toast = useToast()
  const [buscandoCep, setBuscandoCep] = useState(false)

  async function preencherEnderecoPorCep() {
    const cep = form.getValues().cep
    if (!isValidCep(cep)) return

    setBuscandoCep(true)
    try {
      const endereco = await getAddressInfoByCep(cep)
      form.setValues({
        ...(endereco.street && { logradouro: endereco.street }),
        ...(endereco.neighborhood && { bairro: endereco.neighborhood }),
        ...(endereco.city && { cidade: endereco.city }),
        ...(endereco.state && { estado: endereco.state }),
      })
    } catch (erro) {
      if (erro instanceof GetAddressInfoByCepNotFoundError) {
        toast.warning('CEP não encontrado', 'Confira o CEP digitado.')
      } else {
        toast.warning('Não foi possível buscar o CEP', 'Preencha o endereço manualmente.')
      }
    } finally {
      setBuscandoCep(false)
    }
  }

  if (secao === 'endereco') {
    const cep = form.getInputProps('cep')

    return (
      <GradeAutoAjuste $larguraMinima="240px">
        <Input
          label="CEP"
          placeholder="00000-000"
          inputMode="numeric"
          {...cep}
          disabled={disabled || buscandoCep}
          mask={formatarCep}
          maxLength={9}
          hint="Preenchido automaticamente ao sair do campo."
          onBlur={(evento) => {
            cep.onBlur?.(evento)
            preencherEnderecoPorCep()
          }}
        />
        <Input label="Logradouro" placeholder="Rua, avenida..." {...form.getInputProps('logradouro')} disabled={disabled} maxLength={150} />
        <Input label="Número" {...form.getInputProps('numero')} disabled={disabled} maxLength={20} />
        <Input label="Complemento" placeholder="Apto, bloco..." {...form.getInputProps('complemento')} disabled={disabled} maxLength={100} />
        <Input label="Bairro" {...form.getInputProps('bairro')} disabled={disabled} maxLength={100} />
        <Input label="Cidade" {...form.getInputProps('cidade')} disabled={disabled} maxLength={100} />
        <Select<string>
          label="UF"
          options={OPCOES_UF}
          value={form.values.estado || null}
          error={form.errors.estado as string | undefined}
          disabled={disabled}
          searchable
          clearable
          placeholder="Selecionar UF..."
          onChange={(valor) => form.setFieldValue('estado', valor ?? '')}
        />
      </GradeAutoAjuste>
    )
  }

  return (
    <GradeAutoAjuste $larguraMinima="240px">
      <LinhaInteira>
        <Input
          label={rotuloNome}
          required
          placeholder="Digite o nome completo..."
          {...form.getInputProps('nome')}
          disabled={disabled}
          maxLength={120}
        />
      </LinhaInteira>

      <Input
        label="CPF"
        required
        placeholder="000.000.000-00"
        inputMode="numeric"
        {...form.getInputProps('cpf')}
        disabled={disabled}
        mask={formatarCpf}
        maxLength={14}
        hint="Usado como identificador único da pessoa."
      />

      <DatePicker
        label="Data de nascimento"
        value={form.values.dataNascimento}
        error={form.errors.dataNascimento as string | undefined}
        disabled={disabled}
        onChange={(evento) => form.setFieldValue('dataNascimento', evento.target.value)}
        onBlur={() => form.validateField('dataNascimento')}
      />

      <Input
        label="Telefone"
        placeholder="(00) 00000-0000"
        inputMode="tel"
        {...form.getInputProps('telefone')}
        disabled={disabled}
        mask={formatarTelefone}
        maxLength={15}
      />

      <Input
        label="E-mail"
        type="email"
        placeholder="nome@email.com"
        {...form.getInputProps('email')}
        disabled={disabled}
        maxLength={120}
      />

      <LinhaInteira>
        <RadioGroup<Sexo>
          label="Sexo"
          options={OPCOES_SEXO}
          value={form.values.sexo}
          error={form.errors.sexo as string | undefined}
          onChange={(valor) => form.setFieldValue('sexo', valor)}
        />
      </LinhaInteira>
    </GradeAutoAjuste>
  )
}
