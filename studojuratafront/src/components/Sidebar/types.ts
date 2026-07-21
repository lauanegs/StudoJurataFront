export interface SidebarMenuItem {
  label: string
  path: string
}

export interface SidebarProps {
  usuario: string
  cargo: string
  menus: SidebarMenuItem[]
}
