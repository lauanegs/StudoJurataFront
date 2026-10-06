import { Navigate, useLocation } from 'react-router-dom'

import { CarregandoTela } from '@/components/feedback/CarregandoTela'
import { useAuth } from '@/hooks/useAuth'

import type { RotaProtegidaProps } from './types'
/** Guarda de rota */
export function RotaProtegida({ children, perfis }: RotaProtegidaProps) {
  const { usuario, loading } = useAuth()
  const localizacao = useLocation()

  if (loading) {
    return <CarregandoTela />
  }

  if (!usuario) {
    return <Navigate to="/" replace state={{ de: localizacao.pathname }} />
  }

  if (!perfis.includes(usuario.tipoUsuario)) {
    return <Navigate to="/nao-autorizado" replace />
  }

  return <>{children}</>
}
