import styled from 'styled-components'
import { AlertTriangle, RotateCcw } from 'lucide-react'

import { Button } from '../ui/Button'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

const Icone = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 64px;
  height: 64px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme }) => theme.colors.errorBackground};
  color: ${({ theme }) => theme.colors.error};

  svg {
    width: 28px;
    height: 28px;
  }
`

const Titulo = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Mensagem = styled.p`
  max-width: 420px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

interface ErroCarregamentoProps {
  mensagem: string
  onRetry?: () => void
  titulo?: string
}

export function ErroCarregamento({
  mensagem,
  onRetry,
  titulo = 'Não foi possível carregar',
}: ErroCarregamentoProps) {
  return (
    <Container role="alert">
      <Icone aria-hidden="true">
        <AlertTriangle />
      </Icone>

      <Titulo>{titulo}</Titulo>
      <Mensagem>{mensagem}</Mensagem>

      {onRetry && (
        <Button variant="secondary" icon={<RotateCcw />} onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </Container>
  )
}
