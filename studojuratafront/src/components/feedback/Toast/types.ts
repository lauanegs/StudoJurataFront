import type { Toast as ToastModel } from '@/contexts/toast/types'
export interface ToastViewportProps {
  toasts: ToastModel[]
  onFechar: (id: string) => void
}
