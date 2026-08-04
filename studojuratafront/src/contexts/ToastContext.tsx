import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { ToastViewport } from '../components/feedback/Toast'
import { ToastContexto, type ContextoToast, type Toast } from './toastContexto'

const DURACAO_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const temporizadores = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const fechar = useCallback((id: string) => {
    setToasts((atuais) => atuais.filter((toast) => toast.id !== id))

    const temporizador = temporizadores.current.get(id)
    if (temporizador) {
      clearTimeout(temporizador)
      temporizadores.current.delete(id)
    }
  }, [])

  const mostrar = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      setToasts((atuais) => [...atuais, { ...toast, id }])
      temporizadores.current.set(
        id,
        setTimeout(() => fechar(id), DURACAO_MS),
      )
    },
    [fechar],
  )

  const valor = useMemo<ContextoToast>(
    () => ({
      toasts,
      mostrar,
      fechar,
      success: (titulo, descricao) => mostrar({ tipo: 'success', titulo, descricao }),
      error: (titulo, descricao) => mostrar({ tipo: 'error', titulo, descricao }),
      warning: (titulo, descricao) => mostrar({ tipo: 'warning', titulo, descricao }),
      info: (titulo, descricao) => mostrar({ tipo: 'info', titulo, descricao }),
    }),
    [toasts, mostrar, fechar],
  )

  return (
    <ToastContexto.Provider value={valor}>
      {children}
      <ToastViewport toasts={toasts} onFechar={fechar} />
    </ToastContexto.Provider>
  )
}
