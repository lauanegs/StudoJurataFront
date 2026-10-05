import styled from 'styled-components'

const Grupo = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxs};
`

const Opcao = styled.button<{ $ativa: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.buttonPurple};

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};

  color: ${({ theme, $ativa }) => ($ativa ? theme.colors.white : theme.colors.buttonPurple)};
  background: ${({ theme, $ativa }) => ($ativa ? theme.gradients.primary : theme.colors.white)};

  transition: background ${({ theme }) => theme.transition.base};

  &:disabled {
    opacity: 0.5;
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }
`

interface SeletorOpcoesProps<T extends string> {
  rotuloAcessivel: string
  value: T
  options: { value: T; label: string }[]
  onChange: (valor: T) => void
  disabled?: boolean
}

/** Escolha entre poucas opções excludentes, em botões pequenos (ex.: tipo de questão). */
export function SeletorOpcoes<T extends string>({
  rotuloAcessivel,
  value,
  options,
  onChange,
  disabled,
}: SeletorOpcoesProps<T>) {
  return (
    <Grupo role="group" aria-label={rotuloAcessivel}>
      {options.map((opcao) => (
        <Opcao
          key={opcao.value}
          type="button"
          $ativa={opcao.value === value}
          disabled={disabled}
          aria-pressed={opcao.value === value}
          onClick={() => onChange(opcao.value)}
        >
          {opcao.label}
        </Opcao>
      ))}
    </Grupo>
  )
}
