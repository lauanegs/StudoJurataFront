import { useEffect, useRef } from 'react'

export function useHidratar<T>(dados: T | null | undefined, aplicar: (dados: T) => void) {
  const jaAplicado = useRef<T | null>(null)
  const aplicarRef = useRef(aplicar)

  useEffect(() => {
    aplicarRef.current = aplicar
  })

  useEffect(() => {
    if (!dados || jaAplicado.current === dados) return

    jaAplicado.current = dados
    aplicarRef.current(dados)
  }, [dados])
}
