import type { ReactNode } from 'react'

import type { TipoUsuario } from '@/dominios/comum/types'

export interface ItemMenu {
  label: string
  caminho: string
  icon: ReactNode
  prefixos?: string[]
}

export interface SeletorCurso {
  opcoes: { value: number; label: string }[]
  valor: number | null
  onChange: (turmaId: number) => void
}

export interface SidebarProps {
  usuario: string
  cargo: string
  perfil: TipoUsuario
  itens: ItemMenu[]
  colapsada: boolean
  onToggleCollapse: () => void
  onExit: () => void
  seletorCurso?: SeletorCurso
  abertaNoMobile?: boolean
  onCloseOnMobile?: () => void
}
