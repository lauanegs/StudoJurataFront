import type { TipoUsuario } from '@/dominios/comum/types'

export interface RotaProtegidaProps {
  children: React.ReactNode
  perfis: TipoUsuario[]
}
