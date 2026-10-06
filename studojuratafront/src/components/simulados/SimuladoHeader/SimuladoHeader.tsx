import { Clock, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { formatarTempo } from '@/utils/format'

import { Container, Esquerda, Logo, Titulo, Direita, Cronometro } from './styles'
import type { SimuladoHeaderProps } from './types'

export function SimuladoHeader({
  titulo,
  segundos,
  regressivo = false,
  onExit,
  rotuloSair = 'Sair',
}: SimuladoHeaderProps) {

  const alerta = regressivo && segundos <= 60

  return (
    <Container>
      <Esquerda>
        <Logo src="/images/marca/logo.png" alt="Studo Jurata" />
        <Titulo>{titulo}</Titulo>
      </Esquerda>

      <Direita>
        <Cronometro
          $alerta={alerta}
          role="timer"
          aria-live={alerta ? 'assertive' : 'off'}
          title={regressivo ? 'Tempo restante' : 'Tempo decorrido'}
        >
          <Clock aria-hidden="true" />
          {formatarTempo(segundos)}
        </Cronometro>

        {onExit && (
          <Button variant="info" size="large" icon={<LogOut />} onClick={onExit}>
            {rotuloSair}
          </Button>
        )}
      </Direita>
    </Container>
  )
}
