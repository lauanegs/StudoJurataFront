import { useCallback, useMemo, useState } from 'react'
import type { TipoUsuario } from '../types'

interface AuthUser {
  nome: string
  tipoUsuario: TipoUsuario
}

const STORAGE_KEY = '@studojurata:usuario'

function readStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [usuario, setUsuario] = useState<AuthUser | null>(() => readStoredUser())

  const login = useCallback((nome: string, tipoUsuario: TipoUsuario) => {
    const usuarioLogado: AuthUser = { nome, tipoUsuario }
    setUsuario(usuarioLogado)

    try {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(usuarioLogado))
    } catch {
      // ambiente sem localStorage disponível, segue apenas em memória
    }
  }, [])

  const logout = useCallback(() => {
    setUsuario(null)

    try {
      window.localStorage?.removeItem(STORAGE_KEY)
    } catch {
      // ignora
    }
  }, [])

  const cargo = useMemo(() => {
    switch (usuario?.tipoUsuario) {
      case 'ADMINISTRADOR':
        return 'Administrador'
      case 'PROFESSOR':
        return 'Professor'
      case 'ALUNO':
        return 'Aluno'
      default:
        return ''
    }
  }, [usuario])

  return {
    usuario,
    cargo,
    autenticado: Boolean(usuario),
    login,
    logout,
  }
}
