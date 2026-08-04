import { createPortal } from 'react-dom'
import styled, { css, keyframes } from 'styled-components'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

import type { Toast as ToastModel, TipoToast } from '../../contexts/toastContexto'

const entrar = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
`

const Viewport = styled.div`
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

const Item = styled.div<{ $tipo: TipoToast }>`
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

const Icone = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 2px;

  svg {
    width: 18px;
    height: 18px;
  }
`

const Conteudo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
`

const Descricao = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`

const Fechar = styled.button`
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

const ICONES: Record<TipoToast, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

interface ToastViewportProps {
  toasts: ToastModel[]
  onFechar: (id: string) => void
}

export function ToastViewport({ toasts, onFechar }: ToastViewportProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <Viewport aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icone_ = ICONES[toast.tipo]

        return (
          <Item key={toast.id} $tipo={toast.tipo} role={toast.tipo === 'error' ? 'alert' : 'status'}>
            <Icone aria-hidden="true">
              <Icone_ />
            </Icone>

            <Conteudo>
              <Titulo>{toast.titulo}</Titulo>
              {toast.descricao && <Descricao>{toast.descricao}</Descricao>}
            </Conteudo>

            <Fechar type="button" aria-label="Fechar notificação" onClick={() => onFechar(toast.id)}>
              <X />
            </Fechar>
          </Item>
        )
      })}
    </Viewport>,
    document.body,
  )
}
