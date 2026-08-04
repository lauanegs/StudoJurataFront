import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: stretch;

  width: 100%;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 0;
  }
`

/**
 * Confirmado no Figma (aba "Realizar chamada"): estilo de sublinhado, não
 * pílula. Ativo/inativo variam só por fundo e borda inferior — o texto
 * mantém a mesma cor e peso nos dois estados.
 */
export const Item = styled.button<{ $ativa: boolean }>`
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  height: 52px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radius.md} ${({ theme }) => theme.radius.md} 0 0;
  border-bottom: 2px solid
    ${({ theme, $ativa }) => ($ativa ? theme.colors.buttonPurple : theme.colors.border)};
  box-shadow: ${({ theme }) => theme.shadow.base};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  letter-spacing: -0.8px;
  white-space: nowrap;

  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ $ativa }) => ($ativa ? 'rgba(230, 234, 242, 0.3)' : 'transparent')};

  transition: background ${({ theme }) => theme.transition.base};

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

export const Contador = styled.span<{ $ativa: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 20px;
  height: 20px;
  padding: 0 6px;

  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme, $ativa }) => ($ativa ? theme.colors.purple : theme.colors.background)};
  color: ${({ theme, $ativa }) => ($ativa ? theme.colors.white : theme.colors.textSecondary)};

  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`
