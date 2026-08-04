import { createContext, useContext } from 'react'

export type TipoToast = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  tipo: TipoToast
  titulo: string
  descricao?: string
}

export interface ContextoToast {
  toasts: Toast[]
  mostrar: (toast: Omit<Toast, 'id'>) => void
  success: (titulo: string, descricao?: string) => void
  error: (titulo: string, descricao?: string) => void
  warning: (titulo: string, descricao?: string) => void
  info: (titulo: string, descricao?: string) => void
  fechar: (id: string) => void
}

export const ToastContexto = createContext<ContextoToast | null>(null)

export function useToast() {
  const contexto = useContext(ToastContexto)

  if (!contexto) {
    throw new Error('useToast precisa estar dentro de <ToastProvider />')
  }

  return contexto
}
