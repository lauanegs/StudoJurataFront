import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ShieldAlert } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { ROTA_INICIAL_POR_PERFIL } from '../../contexts/authContexto'
import { useAuth } from '../../hooks/useAuth'

const Tela = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.lg};

  text-align: center;
`

const Icone = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 88px;
  height: 88px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme }) => theme.colors.errorBackground};
  color: ${({ theme }) => theme.colors.error};

  svg {
    width: 40px;
    height: 40px;
  }
`

const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Descricao = styled.p`
  max-width: 460px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export default function NaoAutorizado() {
  const navegar = useNavigate()
  const { usuario, cargo } = useAuth()

  return (
    <Tela>
      <Icone aria-hidden="true">
        <ShieldAlert />
      </Icone>

      <Titulo>Acesso não autorizado</Titulo>

      <Descricao>
        {usuario
          ? `Seu perfil (${cargo}) não tem permissão para abrir esta página. Se você precisa desse acesso, fale com a coordenação da escola.`
          : 'Faça login para continuar.'}
      </Descricao>

      <Button
        onClick={() =>
          navegar(usuario ? ROTA_INICIAL_POR_PERFIL[usuario.tipoUsuario] : '/', { replace: true })
        }
      >
        {usuario ? 'Voltar para o início' : 'Ir para o login'}
      </Button>
    </Tela>
  )
}
