import styled, { css, keyframes } from 'styled-components'

import type { TipoToast } from '@/contexts/toast/toastContexto'

export const entrar = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
`

export const Viewport = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  z-index: ${({ theme }) => theme.zIndex.toast};

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
`

export const Item = styled.div<{ $tipo: TipoToast }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};

  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.card};
  border-left: 4px solid;

  pointer-events: auto;
  animation: ${entrar} ${({ theme }) => theme.transition.base};

  ${({ theme, $tipo }) =>
    ({
      success: css`
        border-left-color: ${theme.colors.success};
        color: ${theme.colors.successText};
      `,
      error: css`
        border-left-color: ${theme.colors.error};
        color: ${theme.colors.errorText};
      `,
      warning: css`
        border-left-color: ${theme.colors.warning};
        color: ${theme.colors.warningText};
      `,
      info: css`
        border-left-color: ${theme.colors.blue};
        color: ${theme.colors.infoText};
      `,
    })[$tipo]}
`

export const Icone = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 2px;

  svg {
    width: 18px;
    height: 18px;
  }
`

export const Conteudo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
`

export const Descricao = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`

export const Fechar = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.textTertiary};

  &:hover {
    color: ${({ theme }) => theme.colors.textStrong};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`
