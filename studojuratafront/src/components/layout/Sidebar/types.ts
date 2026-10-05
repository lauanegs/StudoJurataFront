import type { ReactNode } from 'react'

import type { TipoUsuario } from '../../../types/comum'

export interface ItemMenu {
  label: string
  caminho: string
  icon: ReactNode
  /** Rotas filhas que também devem manter o item marcado como ativo. */
  prefixos?: string[]
}

/** Select de curso na sidebar do aluno com mais de um curso. */
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
  /** Em telas pequenas a sidebar vira um painel sobreposto. */
  abertaNoMobile?: boolean
  onCloseOnMobile?: () => void
}
