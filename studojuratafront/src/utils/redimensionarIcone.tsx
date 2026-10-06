import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

export function comTamanho(icone: ReactNode, tamanho: number): ReactNode {
  if (!isValidElement(icone)) return icone
  return cloneElement(icone as ReactElement<{ size?: number }>, { size: tamanho })
}
