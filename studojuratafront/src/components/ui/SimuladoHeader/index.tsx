import styled, { css, keyframes } from 'styled-components'
import { Clock, LogOut } from 'lucide-react'

import { Button } from '../Button'
import { formatarTempo } from '../../../utils/format'

const pulsar = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
`

const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
`

const Esquerda = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`

const Logo = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
`

const Titulo = styled.strong`
  font-size: 28px;
  letter-spacing: -1.4px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Direita = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Cronometro = styled.div<{ $alerta: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme, $alerta }) => ($alerta ? theme.colors.error : 'rgba(115, 115, 115, 0.15)')};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-variant-numeric: tabular-nums;

  background: ${({ theme, $alerta }) => ($alerta ? theme.colors.errorBackground : theme.colors.white)};
  color: ${({ theme, $alerta }) => ($alerta ? theme.colors.errorText : theme.colors.textSecondary)};

  ${({ $alerta }) =>
    $alerta &&
    css`
      animation: ${pulsar} 1.2s ease-in-out infinite;
    `}

  svg {
    width: 16px;
    height: 16px;
  }
`

interface SimuladoHeaderProps {
  titulo: string
  /** Segundos decorridos (contagem crescente) ou restantes (regressiva). */
  segundos: number
  /** true quando o simulado tem tempoLimite e estamos contando para trás. */
  regressivo?: boolean
  onExit?: () => void
  rotuloSair?: string
}

export function SimuladoHeader({
  titulo,
  segundos,
  regressivo = false,
  onExit,
  rotuloSair = 'Sair',
}: SimuladoHeaderProps) {
  // Alerta visual no último minuto de uma prova cronometrada.
  const alerta = regressivo && segundos <= 60

  return (
    <Container>
      <Esquerda>
        <Logo src="/images/logo.png" alt="Studo Jurata" />
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
          <Button variant="secondary" size="small" icon={<LogOut />} onClick={onExit}>
            {rotuloSair}
          </Button>
        )}
      </Direita>
    </Container>
  )
}
