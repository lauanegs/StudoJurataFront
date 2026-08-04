import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Compass } from 'lucide-react'

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
  background: ${({ theme }) => theme.colors.purpleSoft};
  color: ${({ theme }) => theme.colors.purple};

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
  max-width: 420px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export default function NaoEncontrada() {
  const navegar = useNavigate()
  const { usuario } = useAuth()

  return (
    <Tela>
      <Icone aria-hidden="true">
        <Compass />
      </Icone>

      <Titulo>Página não encontrada</Titulo>
      <Descricao>O endereço acessado não existe ou foi movido.</Descricao>

      <Button
        onClick={() =>
          navegar(usuario ? ROTA_INICIAL_POR_PERFIL[usuario.tipoUsuario] : '/', { replace: true })
        }
      >
        Voltar para o início
      </Button>
    </Tela>
  )
}
