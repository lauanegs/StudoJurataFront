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
