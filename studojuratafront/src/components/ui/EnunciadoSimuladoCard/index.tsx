import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Volume2, VolumeX } from 'lucide-react'

import { animacaoFlutuar } from '../../../styles/animations'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};

  /* Confirmado no Figma: degradê azul horizontal sobre base cinza, não o roxo do banner. */
  background: linear-gradient(90deg, #049dbf 0%, rgba(4, 157, 191, 0.5) 100%), #e6eaf2;
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.floating};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`

const Mascote = styled.img`
  width: 136px;
  height: 136px;
  flex-shrink: 0;
  object-fit: contain;
  ${animacaoFlutuar}
`

const Balao = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};

  background: ${({ theme }) => theme.colors.white};
  border-radius: 50px;
  box-shadow: ${({ theme }) => theme.shadow.floating};

  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);

    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-right: 14px solid ${({ theme }) => theme.colors.white};

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
      display: none;
    }
  }
`

const Texto = styled.p`
  flex: 1;
  min-width: 0;

  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.blue};
  text-align: center;
  overflow-wrap: anywhere;
`

const BotaoAudio = styled.button<{ $falando: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 48px;
  height: 48px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme, $falando }) => ($falando ? theme.colors.purple : theme.colors.blue)};
  color: ${({ theme }) => theme.colors.white};

  transition:
    transform ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.base};

  &:hover {
    transform: scale(1.06);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  svg {
    width: 22px;
    height: 22px;
  }
`

interface EnunciadoSimuladoCardProps {
  enunciado: string
  mascoteSrc?: string
}

/**
 * Enunciado da questão em formato de balão de fala.
 *
 * O botão de áudio usa a Web Speech API do próprio navegador (sem dependência
 * externa) e some silenciosamente onde a API não existe.
 */
export function EnunciadoSimuladoCard({
  enunciado,
  mascoteSrc = '/images/mascoteEnunciado.png',
}: EnunciadoSimuladoCardProps) {
  const [falando, setFalando] = useState(false)

  const suportaVoz = typeof window !== 'undefined' && 'speechSynthesis' in window

  const alternarAudio = useCallback(() => {
    if (!suportaVoz) return

    if (falando) {
      window.speechSynthesis.cancel()
      setFalando(false)
      return
    }

    const fala = new SpeechSynthesisUtterance(enunciado)
    fala.lang = 'pt-BR'
    fala.rate = 0.95
    fala.onend = () => setFalando(false)
    fala.onerror = () => setFalando(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(fala)
    setFalando(true)
  }, [enunciado, falando, suportaVoz])

  return (
    <Container>
      <Mascote src={mascoteSrc} alt="" aria-hidden="true" />

      <Balao>
        <Texto>{enunciado}</Texto>

        {suportaVoz && (
          <BotaoAudio
            type="button"
            $falando={falando}
            aria-label={falando ? 'Parar leitura do enunciado' : 'Ouvir o enunciado'}
            onClick={alternarAudio}
          >
            {falando ? <VolumeX /> : <Volume2 />}
          </BotaoAudio>
        )}
      </Balao>
    </Container>
  )
}
