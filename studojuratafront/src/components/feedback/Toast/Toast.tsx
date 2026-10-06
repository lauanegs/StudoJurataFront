import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

import type { TipoToast } from '@/contexts/toast/types'
import { Conteudo, Descricao, Fechar, Icone, Item, Titulo, Viewport } from './styles'
import type { ToastViewportProps } from './types'

const ICONES: Record<TipoToast, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
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
