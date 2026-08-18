import { createContext, useContext } from 'react'

export interface ContextoPeriodoLetivo {
  periodoLetivo: string
  definirPeriodoLetivo: (periodo: string) => void
}

export const PeriodoLetivoContexto = createContext<ContextoPeriodoLetivo | null>(null)

export function usePeriodoLetivo() {
  const contexto = useContext(PeriodoLetivoContexto)

  if (!contexto) {
    throw new Error('usePeriodoLetivo precisa estar dentro de <PeriodoLetivoProvider />')
  }

  return contexto
}
