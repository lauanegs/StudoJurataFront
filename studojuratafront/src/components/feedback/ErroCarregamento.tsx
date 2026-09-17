import { AlertTriangle, RotateCcw } from 'lucide-react'

import { Button } from '../ui/Button'
import { Container, Descricao, Icone, Titulo } from './styles'

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
      <Icone aria-hidden="true" $erro>
        <AlertTriangle />
      </Icone>

      <Titulo>{titulo}</Titulo>
      <Descricao $larguraMaxima="420px">{mensagem}</Descricao>

      {onRetry && (
        <Button variant="secondary" icon={<RotateCcw />} onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </Container>
  )
}
