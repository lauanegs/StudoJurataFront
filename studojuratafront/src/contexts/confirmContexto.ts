import { createContext, useContext } from 'react'

export interface PedidoConfirmacao {
  titulo: string
  descricao?: string
  rotuloConfirmar?: string
  rotuloCancelar?: string
  /** 'danger' pinta o botão de confirmação de vermelho (exclusões). */
  tone?: 'danger' | 'default'
}

export interface ContextoConfirmacao {
  confirmar: (pedido: PedidoConfirmacao) => Promise<boolean>
}

export const ConfirmContexto = createContext<ContextoConfirmacao | null>(null)

export function useConfirm() {
  const contexto = useContext(ConfirmContexto)

  if (!contexto) {
    throw new Error('useConfirm precisa estar dentro de <ConfirmProvider />')
  }

  return contexto.confirmar
}
