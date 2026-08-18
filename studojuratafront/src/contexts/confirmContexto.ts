import { createContext, useContext } from 'react'

export interface PedidoConfirmacao {
  titulo: string
  descricao?: string
  rotuloConfirmar?: string
  rotuloCancelar?: string
  /** 'danger' pinta o botão de confirmação de vermelho (exclusões). */
  tone?: 'danger' | 'default'
  /**
   * Executada só depois que o usuário clica em confirmar. O modal permanece
   * aberto (botão em `loading`, fechar bloqueado) até ela terminar — assim o
   * spinner reflete a operação real, não só o clique. Erros devem ser
   * tratados aqui dentro (toast), como já é o padrão do projeto; o modal
   * fecha de qualquer forma ao final, com sucesso ou falha.
   */
  aoConfirmar: () => Promise<void>
}

export interface ContextoConfirmacao {
  confirmar: (pedido: PedidoConfirmacao) => Promise<void>
}

export const ConfirmContexto = createContext<ContextoConfirmacao | null>(null)

/**
 * Devolve `confirmar(pedido)`: abre o modal e só resolve quando ele fecha
 * (após `pedido.aoConfirmar()` terminar, ou imediatamente se o usuário
 * cancelar). Não é preciso checar um booleano de retorno — se o usuário
 * cancelar, `aoConfirmar` simplesmente não é chamado.
 */
export function useConfirm() {
  const contexto = useContext(ConfirmContexto)

  if (!contexto) {
    throw new Error('useConfirm precisa estar dentro de <ConfirmProvider />')
  }

  return contexto.confirmar
}
