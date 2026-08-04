import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`

export const Linha = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`

export const Entrada = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

export const Trilho = styled.span<{ $ligado: boolean }>`
  position: relative;

  width: 46px;
  height: 26px;
  flex-shrink: 0;

  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme, $ligado }) => ($ligado ? theme.gradients.primary : theme.colors.borderStrong)};

  transition: background ${({ theme }) => theme.transition.base};

  ${Entrada}:focus-visible + & {
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ $ligado }) => ($ligado ? '23px' : '3px')};

    width: 20px;
    height: 20px;

    border-radius: ${({ theme }) => theme.radius.circle};
    background: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadow.light};

    transition: left ${({ theme }) => theme.transition.base};
  }
`

export const Texto = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textStrong};
`

export const Estado = styled.span<{ $ligado: boolean }>`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme, $ligado }) => ($ligado ? theme.colors.successText : theme.colors.textTertiary)};
`

export const Descricao = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`
