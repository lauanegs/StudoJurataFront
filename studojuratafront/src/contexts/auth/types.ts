import type { LoginResponse } from '@/dominios/autenticacao/types'
import type { TipoUsuario } from '@/dominios/comum/types'

export interface ContextoAutenticacao {
  usuario: LoginResponse | null
  cargo: string
  autenticado: boolean
  loading: boolean
  entrar: (username: string, senha: string) => Promise<LoginResponse>
  sair: () => Promise<void>
  rotaInicial: (tipo?: TipoUsuario) => string
}
