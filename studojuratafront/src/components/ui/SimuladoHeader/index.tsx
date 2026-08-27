import styled, { css, keyframes } from 'styled-components'
import { Clock, LogOut } from 'lucide-react'

import { Button } from '../Button'
import { formatarTempo } from '../../../utils/format'

const pulsar = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
`

/* Confirmado no Figma: este header cobre a largura inteira da tela — sem
   cantos arredondados, encostado nas bordas (só o conteúdo abaixo dele fica
   dentro de um miolo com padding). */
const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};

  background: ${({ theme }) => theme.colors.white};
`

const Esquerda = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`

const Logo = styled.img`
  width: 44px;
  height: 44px;
  object-fit: contain;
`

const Titulo = styled.strong`
  font-size: 24px;
  letter-spacing: -1.2px;
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
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  /* Altura de 56px pra bater exatamente com o botão "Sair" (size="large")
     ao lado — mesmo padrão de altura já usado nos campos/botões do header. */
  height: 56px;
  padding: 0 ${({ theme }) => theme.spacing.xl};
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
          <Button variant="info" size="large" icon={<LogOut />} onClick={onExit}>
            {rotuloSair}
          </Button>
        )}
      </Direita>
    </Container>
  )
}
