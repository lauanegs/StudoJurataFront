import type { ReactNode } from 'react'

export interface ItemListaInfo {
  icon: ReactNode
  texto: ReactNode
}

export interface ListaInfoProps {
  itens: ItemListaInfo[]
}
