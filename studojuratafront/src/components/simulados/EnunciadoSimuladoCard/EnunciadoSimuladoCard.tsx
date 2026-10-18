import { useCallback, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

import { criarFalaDivertida } from '@/utils/vozNarrador'
import { Container, Mascote, Balao, Texto, BotaoAudio } from './styles'
import type { EnunciadoSimuladoCardProps } from './types'

export function EnunciadoSimuladoCard({
  enunciado,
  mascoteSrc = '/images/mascote/mascote-enunciado.png',
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

    const fala = criarFalaDivertida(enunciado)
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
