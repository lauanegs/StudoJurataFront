import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { ApiError, aoExpirarSessao } from '@/dominios/comum/api'
import { autenticacao } from '@/dominios/autenticacao/service'
import { esquecerCursoEscolhido } from '@/utils/cursoEscolhido'
import { ROTULO_TIPO_USUARIO } from '@/utils/labels'
import type { LoginResponse } from '@/dominios/autenticacao/types'
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
    esquecerCursoEscolhido()
    setUsuario(logado)
    gravarCache(logado)
    return logado
  }, [])

  const sair = useCallback(async () => {
    try {
      await autenticacao.sair()
    } catch (erro) {
      if (!(erro instanceof ApiError)) throw erro
    } finally {
      setUsuario(null)
      gravarCache(null)
      esquecerCursoEscolhido()
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
