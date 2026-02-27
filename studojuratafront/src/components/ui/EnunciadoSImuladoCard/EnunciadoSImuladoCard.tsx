import * as S from './styles'
import type { EnunciadoSimuladoCardProps } from './types'
import { Volume2 } from 'lucide-react'

export function EnunciadoSimuladoCard({
  enunciado,
  mascoteSrc = "/images/mascote.png",
  onPlayAudio
}: EnunciadoSimuladoCardProps) {
  return (
    <S.Container>
      <S.Mascote src={mascoteSrc} alt="Mascote" />

      <S.BalaoContainer>
        <S.Texto>{enunciado}</S.Texto>
        
        <S.AudioButton onClick={onPlayAudio} aria-label="Ouvir enunciado">
          <Volume2 size={28} fill="currentColor" />
        </S.AudioButton>
      </S.BalaoContainer>
    </S.Container>
  )
}