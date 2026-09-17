import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { ConfirmContexto, type PedidoConfirmacao } from './confirmContexto'

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null)
  const [processando, setProcessando] = useState(false)
  const resolver = useRef<(() => void) | null>(null)

  const confirmar = useCallback(
    (novoPedido: PedidoConfirmacao) =>
      new Promise<void>((resolve) => {
        resolver.current = resolve
        setProcessando(false)
        setPedido(novoPedido)
      }),
    [],
  )

  // `processando` só é zerado no próximo pedido: zerar aqui faria o botão
  // piscar do spinner para o rótulo durante a transição de fechamento.
  const fechar = useCallback(() => {
    resolver.current?.()
    resolver.current = null
    setPedido(null)
  }, [])

  const valor = useMemo(() => ({ confirmar }), [confirmar])

  return (
    <ConfirmContexto.Provider value={valor}>
      {children}

      <ConfirmDialog
        aberto={pedido !== null}
        titulo={pedido?.titulo ?? ''}
        descricao={pedido?.descricao}
        rotuloConfirmar={pedido?.rotuloConfirmar}
        rotuloCancelar={pedido?.rotuloCancelar}
        tone={pedido?.tone}
        processando={processando}
        onConfirmar={async () => {
          if (!pedido || processando) return

          setProcessando(true)

          try {
            await pedido.aoConfirmar()
          } catch {
            // Rede de segurança para o modal não ficar preso aberto.
          } finally {
            fechar()
          }
        }}
        onCancelar={fechar}
      />
    </ConfirmContexto.Provider>
  )
}
