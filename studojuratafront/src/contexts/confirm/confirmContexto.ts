import { createContext, useContext } from 'react'

export interface PedidoConfirmacao {
  titulo: string
  descricao?: string
  rotuloConfirmar?: string
  rotuloCancelar?: string
  tone?: 'danger' | 'default'
  aoConfirmar: () => Promise<void>
}

export interface ContextoConfirmacao {
  confirmar: (pedido: PedidoConfirmacao) => Promise<void>
}

export const ConfirmContexto = createContext<ContextoConfirmacao | null>(null)

export function useConfirm() {
  const contexto = useContext(ConfirmContexto)

  if (!contexto) {
    throw new Error('useConfirm precisa estar dentro de <ConfirmProvider />')
  }

  return contexto.confirmar
}
