import { createContext, useContext } from 'react'

import type { ContextoToast } from './types'
export const ToastContexto = createContext<ContextoToast | null>(null)

export function useToast() {
  const contexto = useContext(ToastContexto)

  if (!contexto) {
    throw new Error('useToast precisa estar dentro de <ToastProvider />')
  }

  return contexto
}
