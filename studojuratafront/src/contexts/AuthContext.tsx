import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { ApiError, aoExpirarSessao } from '../services/api'
import { autenticacao } from '../services/endpoints'
import { ROTULO_TIPO_USUARIO } from '../utils/labels'
import type { LoginResponse } from '../types'
import {
  AuthContexto,
  CHAVE_USUARIO,
  ROTA_INICIAL_POR_PERFIL,
  type ContextoAutenticacao,
} from './authContexto'

function lerCache(): LoginResponse | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE_USUARIO)
    return bruto ? (JSON.parse(bruto) as LoginResponse) : null
  } catch {
    return null
  }
}

function gravarCache(usuario: LoginResponse | null) {
  try {
    if (usuario) {
      window.localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
    } else {
      window.localStorage.removeItem(CHAVE_USUARIO)
    }
  } catch {
    // Ambiente sem localStorage: a sessão segue apenas em memória.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // O cache local evita o "flash" de tela de login em um F5, mas a fonte da
  // verdade continua sendo o /auth/me — se o cookie de sessão caiu, limpamos.
  const [usuario, setUsuario] = useState<LoginResponse | null>(() => lerCache())
  const [loading, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    autenticacao
      .usuarioAtual()
      .then((atual) => {
        if (!ativo) return
        setUsuario(atual)
        gravarCache(atual)
      })
      .catch(() => {
        if (!ativo) return
        setUsuario(null)
        gravarCache(null)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  // Qualquer 401 vindo de qualquer tela derruba a sessão local.
  useEffect(() => {
    const cancelar = aoExpirarSessao(() => {
      setUsuario(null)
      gravarCache(null)
    })

    return () => {
      cancelar()
    }
  }, [])

  const entrar = useCallback(async (username: string, senha: string) => {
    const logado = await autenticacao.entrar({ username, senha })
    setUsuario(logado)
    gravarCache(logado)
    return logado
  }, [])

  const sair = useCallback(async () => {
    try {
      await autenticacao.sair()
    } catch (erro) {
      // Se a sessão já tinha expirado, o logout falhar não é problema.
      if (!(erro instanceof ApiError)) throw erro
    } finally {
      setUsuario(null)
      gravarCache(null)
    }
  }, [])

  const valor = useMemo<ContextoAutenticacao>(
    () => ({
      usuario,
      cargo: usuario ? ROTULO_TIPO_USUARIO[usuario.tipoUsuario] : '',
      autenticado: Boolean(usuario),
      loading,
      entrar,
      sair,
      rotaInicial: (tipo) => {
        const perfil = tipo ?? usuario?.tipoUsuario
        return perfil ? ROTA_INICIAL_POR_PERFIL[perfil] : '/'
      },
    }),
    [usuario, loading, entrar, sair],
  )

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>
}
