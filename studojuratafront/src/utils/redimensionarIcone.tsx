import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

/**
 * O `styles` da Mantine vira `style` inline plano em cada elemento — uma
 * chave tipo `svg: {...}` não gera seletor nenhum, é só descartada.
 * Ícones (sempre lucide-react neste projeto) aceitam `size` diretamente, o
 * que já resolve width/height do próprio SVG sem depender de CSS aninhado.
 */
export function comTamanho(icone: ReactNode, tamanho: number): ReactNode {
  if (!isValidElement(icone)) return icone
  return cloneElement(icone as ReactElement<{ size?: number }>, { size: tamanho })
}
