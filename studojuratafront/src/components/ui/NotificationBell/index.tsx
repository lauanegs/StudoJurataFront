import { useEffect, useRef, useState, type ReactNode } from 'react'
import styled from 'styled-components'
import { Bell } from 'lucide-react'

import { IconButton } from '../IconButton'

const Container = styled.div`
  position: relative;
`

const Contador = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 18px;
  height: 18px;
  padding: 0 4px;

  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};

  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  pointer-events: none;
`

const Painel = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};

  width: min(340px, calc(100vw - 32px));
  max-height: 380px;
  overflow-y: auto;

  padding: ${({ theme }) => theme.spacing.sm};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.card};
`

const Titulo = styled.p`
  padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: ${({ theme }) => theme.colors.textTertiary};
`

const Vazio = styled.p`
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textTertiary};
  text-align: center;
`

interface NotificationBellProps {
  quantidade: number
  titulo?: string
  children?: ReactNode
}

export function NotificationBell({
  quantidade,
  titulo = 'Avisos',
  children,
}: NotificationBellProps) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return

    function aoClicarFora(evento: MouseEvent) {
      if (!containerRef.current?.contains(evento.target as Node)) setAberto(false)
    }

    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto])

  return (
    <Container ref={containerRef}>
      <IconButton
        label={quantidade > 0 ? `${titulo} (${quantidade} novos)` : titulo}
        icon={<Bell />}
        onClick={() => setAberto((atual) => !atual)}
      />

      {quantidade > 0 && <Contador aria-hidden="true">{quantidade > 9 ? '9+' : quantidade}</Contador>}

      {aberto && (
        <Painel role="region" aria-label={titulo}>
          <Titulo>{titulo}</Titulo>
          {children ?? <Vazio>Nada por aqui no momento.</Vazio>}
        </Painel>
      )}
    </Container>
  )
}
