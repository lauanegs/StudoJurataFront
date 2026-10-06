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
