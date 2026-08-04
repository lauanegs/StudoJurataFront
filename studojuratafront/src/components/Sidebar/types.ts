import type { ReactNode } from 'react'

import type { TipoUsuario } from '../../types'

export interface ItemMenu {
  label: string
  caminho: string
  icon: ReactNode
  /** Rotas filhas que também devem manter o item marcado como ativo. */
  prefixos?: string[]
}

export interface SidebarProps {
  usuario: string
  cargo: string
  perfil: TipoUsuario
  itens: ItemMenu[]
  colapsada: boolean
  onToggleCollapse: () => void
  onExit: () => void
  /** Em telas pequenas a sidebar vira um painel sobreposto. */
  abertaNoMobile?: boolean
  onCloseOnMobile?: () => void
}
