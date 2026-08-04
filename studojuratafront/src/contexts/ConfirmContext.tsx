import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { ConfirmContexto, type PedidoConfirmacao } from './confirmContexto'

type Resolucao = (confirmado: boolean) => void

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null)
  const [processando, setProcessando] = useState(false)
  const resolver = useRef<Resolucao | null>(null)

  const confirmar = useCallback(
    (novoPedido: PedidoConfirmacao) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve
        setPedido(novoPedido)
      }),
    [],
  )

  const responder = useCallback((confirmado: boolean) => {
    resolver.current?.(confirmado)
    resolver.current = null
    setPedido(null)
    setProcessando(false)
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
        onConfirmar={() => {
          setProcessando(true)
          responder(true)
        }}
        onCancelar={() => responder(false)}
      />
    </ConfirmContexto.Provider>
  )
}
