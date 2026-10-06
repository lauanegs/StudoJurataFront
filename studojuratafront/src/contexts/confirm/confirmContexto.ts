import { createContext, useContext } from 'react'

import type { ContextoConfirmacao } from './types'
export const ConfirmContexto = createContext<ContextoConfirmacao | null>(null)

export function useConfirm() {
  const contexto = useContext(ConfirmContexto)

  if (!contexto) {
    throw new Error('useConfirm precisa estar dentro de <ConfirmProvider />')
  }

  return contexto.confirmar
}
