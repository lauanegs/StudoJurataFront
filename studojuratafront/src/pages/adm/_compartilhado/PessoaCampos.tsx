import { useState } from 'react'
import styled from 'styled-components'

import { DatePicker } from '../../../components/ui/DatePicker'
import { Input } from '../../../components/ui/Input'
import { RadioGroup } from '../../../components/ui/RadioGroup'
import { Select } from '../../../components/ui/Select'
import { useToast } from '../../../contexts/toastContexto'
import { formatarCep, formatarCpf, formatarTelefone } from '../../../utils/format'
import { OPCOES_SEXO, OPCOES_UF } from '../../../utils/labels'
import { apenasDigitos } from '../../../utils/validacao'
import type { Sexo } from '../../../types'
import type { DadosPessoa } from './dadosPessoa'

interface EnderecoViaCep {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const LinhaInteira = styled.div`
  grid-column: 1 / -1;
`

interface PessoaCamposProps {
  valores: DadosPessoa
  erros: Partial<Record<keyof DadosPessoa, string>>
  onChange: <K extends keyof DadosPessoa>(campo: K, value: DadosPessoa[K]) => void
  onExit: (campo: keyof DadosPessoa) => void
  disabled?: boolean
  rotuloNome?: string
  /** Confirmado pelo usuário: dados pessoais e endereço viram abas separadas
   * nas telas de Aluno/Professor/Responsável — "dados" (padrão) renderiza só
   * os campos pessoais, "endereco" só o bloco de endereço. */
  secao?: 'dados' | 'endereco'
}

/**
 * Bloco de dados pessoais compartilhado por Aluno, Professor e Responsável.
 *
 * Os três estendem a mesma entidade `Pessoa` no back (relação @OneToOne), então
 * duplicar esses campos em três telas era garantia de divergência.
 */
export function PessoaCampos({
  valores,
  erros,
  onChange,
  onExit,
  disabled,
  rotuloNome = 'Nome completo',
  secao = 'dados',
}: PessoaCamposProps) {
  const toast = useToast()
  const [buscandoCep, setBuscandoCep] = useState(false)

  /** Busca o endereço pelo CEP (ViaCEP) e preenche os demais campos —
   * usuário ainda pode editar tudo depois, isso só evita digitação manual. */
  async function buscarEnderecoPorCep() {
    const digitos = apenasDigitos(valores.cep)
    if (digitos.length !== 8) return

    setBuscandoCep(true)
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`)
      const dados = (await resposta.json()) as EnderecoViaCep

      if (dados.erro) {
        toast.warning('CEP não encontrado', 'Confira o CEP digitado.')
        return
      }

      if (dados.logradouro) onChange('logradouro', dados.logradouro)
      if (dados.bairro) onChange('bairro', dados.bairro)
      if (dados.localidade) onChange('cidade', dados.localidade)
      if (dados.uf) onChange('estado', dados.uf)
    } catch {
      toast.warning('Não foi possível buscar o CEP', 'Preencha o endereço manualmente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  if (secao === 'endereco') {
    return (
      <Grade>
        <Input
          label="CEP"
          placeholder="00000-000"
          inputMode="numeric"
          value={valores.cep}
          error={erros.cep}
          disabled={disabled || buscandoCep}
          mask={formatarCep}
          maxLength={9}
          hint="Preenchido automaticamente ao sair do campo."
          onChange={(evento) => onChange('cep', evento.target.value)}
          onBlur={() => {
            onExit('cep')
            buscarEnderecoPorCep()
          }}
        />

        <Input
          label="Logradouro"
          placeholder="Rua, avenida..."
          value={valores.logradouro}
          error={erros.logradouro}
          disabled={disabled}
          maxLength={150}
          onChange={(evento) => onChange('logradouro', evento.target.value)}
          onBlur={() => onExit('logradouro')}
        />

        <Input
          label="Número"
          value={valores.numero}
          error={erros.numero}
          disabled={disabled}
          maxLength={20}
          onChange={(evento) => onChange('numero', evento.target.value)}
          onBlur={() => onExit('numero')}
        />

        <Input
          label="Complemento"
          placeholder="Apto, bloco..."
          value={valores.complemento}
          error={erros.complemento}
          disabled={disabled}
          maxLength={100}
          onChange={(evento) => onChange('complemento', evento.target.value)}
          onBlur={() => onExit('complemento')}
        />

        <Input
          label="Bairro"
          value={valores.bairro}
          error={erros.bairro}
          disabled={disabled}
          maxLength={100}
          onChange={(evento) => onChange('bairro', evento.target.value)}
          onBlur={() => onExit('bairro')}
        />

        <Input
          label="Cidade"
          value={valores.cidade}
          error={erros.cidade}
          disabled={disabled}
          maxLength={100}
          onChange={(evento) => onChange('cidade', evento.target.value)}
          onBlur={() => onExit('cidade')}
        />

        <Select<string>
          label="UF"
          options={OPCOES_UF}
          value={valores.estado || null}
          error={erros.estado}
          disabled={disabled}
          searchable
          clearable
          placeholder="Selecionar UF..."
          onChange={(value) => onChange('estado', value ?? '')}
        />
      </Grade>
    )
  }

  return (
    <Grade>
      <LinhaInteira>
        <Input
          label={rotuloNome}
          required
          placeholder="Digite o nome completo..."
          value={valores.nome}
          error={erros.nome}
          disabled={disabled}
          maxLength={120}
          onChange={(evento) => onChange('nome', evento.target.value)}
          onBlur={() => onExit('nome')}
        />
      </LinhaInteira>

      <Input
        label="CPF"
        required
        placeholder="000.000.000-00"
        inputMode="numeric"
        value={valores.cpf}
        error={erros.cpf}
        disabled={disabled}
        mask={formatarCpf}
        maxLength={14}
        hint="Usado como identificador único da pessoa."
        onChange={(evento) => onChange('cpf', evento.target.value)}
        onBlur={() => onExit('cpf')}
      />

      <DatePicker
        label="Data de nascimento"
        value={valores.dataNascimento}
        error={erros.dataNascimento}
        disabled={disabled}
        onChange={(evento) => onChange('dataNascimento', evento.target.value)}
        onBlur={() => onExit('dataNascimento')}
      />

      <Input
        label="Telefone"
        placeholder="(00) 00000-0000"
        inputMode="tel"
        value={valores.telefone}
        error={erros.telefone}
        disabled={disabled}
        mask={formatarTelefone}
        maxLength={15}
        onChange={(evento) => onChange('telefone', evento.target.value)}
        onBlur={() => onExit('telefone')}
      />

      <Input
        label="E-mail"
        type="email"
        placeholder="nome@email.com"
        value={valores.email}
        error={erros.email}
        disabled={disabled}
        maxLength={120}
        onChange={(evento) => onChange('email', evento.target.value)}
        onBlur={() => onExit('email')}
      />

      <LinhaInteira>
        <RadioGroup<Sexo>
          label="Sexo"
          options={OPCOES_SEXO.map((opcao) => ({ value: opcao.value, label: opcao.label }))}
          value={valores.sexo}
          onChange={(value) => onChange('sexo', value)}
          error={erros.sexo}
        />
      </LinhaInteira>
    </Grade>
  )
}
