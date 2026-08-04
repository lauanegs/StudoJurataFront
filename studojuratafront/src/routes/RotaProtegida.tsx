import { Navigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { useAuth } from '../hooks/useAuth'
import type { TipoUsuario } from '../types'

const Carregando = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 100vh;

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

interface RotaProtegidaProps {
  children: React.ReactNode
  /** Perfis autorizados. Precisa refletir as regras do SecurityConfig. */
  perfis: TipoUsuario[]
}

/**
 * Guarda de rota.
 *
 * Enquanto o /auth/me não responde, nada é renderizado (evita mandar o usuário
 * para o login em um simples F5). Sem sessão → login; com sessão de outro
 * perfil → tela de "não autorizado".
 */
export function RotaProtegida({ children, perfis }: RotaProtegidaProps) {
  const { usuario, loading } = useAuth()
  const localizacao = useLocation()

  if (loading) {
    return <Carregando role="status">Carregando...</Carregando>
  }

  if (!usuario) {
    return <Navigate to="/" replace state={{ de: localizacao.pathname }} />
  }

  if (!perfis.includes(usuario.tipoUsuario)) {
    return <Navigate to="/nao-autorizado" replace />
  }

  return <>{children}</>
}
