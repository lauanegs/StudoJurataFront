import { SubtituloItem } from '@/components/ui/Header'

import { Lista } from './styles'
import type { ListaInfoProps } from './types'

export function ListaInfo({ itens }: ListaInfoProps) {
  return (
    <Lista>
      {itens.map((item, indice) => (
        <SubtituloItem key={indice} icon={item.icon}>
          {item.texto}
        </SubtituloItem>
      ))}
    </Lista>
  )
}
