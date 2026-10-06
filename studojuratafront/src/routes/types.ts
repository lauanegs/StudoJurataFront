import type { TipoUsuario } from '@/dominios/comum/types'

export interface RotaProtegidaProps {
  children: React.ReactNode
  /** Perfis autorizados. Precisa refletir as regras do SecurityConfig. */
  perfis: TipoUsuario[]
}
