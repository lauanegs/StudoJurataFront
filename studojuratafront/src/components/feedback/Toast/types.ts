import type { Toast as ToastModel } from '@/contexts/toast/toastContexto'

export interface ToastViewportProps {
  toasts: ToastModel[]
  onFechar: (id: string) => void
}
