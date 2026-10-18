import styled from 'styled-components'

export const Grupo = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxs};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: flex;
    width: 100%;

    & > button {
      flex: 1 1 0;
      min-width: 0;
      padding-inline: ${({ theme }) => theme.spacing.xs};
    }
  }
`

export const Opcao = styled.button<{ $ativa: boolean }>`
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
