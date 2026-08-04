import { createContext, useContext } from 'react'

import type { LoginResponse, TipoUsuario } from '../types'

export interface ContextoAutenticacao {
  usuario: LoginResponse | null
  cargo: string
  autenticado: boolean
  /** true enquanto a sessão do servidor ainda está sendo verificada. */
  loading: boolean
  entrar: (username: string, senha: string) => Promise<LoginResponse>
  sair: () => Promise<void>
  rotaInicial: (tipo?: TipoUsuario) => string
}

export const ROTA_INICIAL_POR_PERFIL: Record<TipoUsuario, string> = {
  ADMINISTRADOR: '/adm',
  PROFESSOR: '/professor',
  ALUNO: '/aluno',
}

export const CHAVE_USUARIO = '@studojurata:usuario'

export const AuthContexto = createContext<ContextoAutenticacao | null>(null)

export function useAuthContext() {
  const contexto = useContext(AuthContexto)

  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider />')
  }

  return contexto
}
