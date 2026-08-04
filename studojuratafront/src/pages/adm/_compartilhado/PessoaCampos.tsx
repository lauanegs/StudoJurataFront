import styled from 'styled-components'

import { Input } from '../../../components/ui/Input'
import { RadioGroup } from '../../../components/ui/RadioGroup'
import { formatarCpf, formatarTelefone } from '../../../utils/format'
import { OPCOES_SEXO } from '../../../utils/labels'
import type { Sexo } from '../../../types'
import type { DadosPessoa } from './dadosPessoa'

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
}: PessoaCamposProps) {
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

      <Input
        label="Data de nascimento"
        type="date"
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
