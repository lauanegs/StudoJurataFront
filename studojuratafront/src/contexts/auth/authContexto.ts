import { createContext, useContext } from 'react'

import type { TipoUsuario } from '@/dominios/comum/types'

import type { ContextoAutenticacao } from './types'
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
