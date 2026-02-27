import * as S from './styles'
import type { BannerProps } from './types'

export function Banner({
  titulo = "Bem vindo ao Studo Jurata!",
  subtitulo = "Vamos estudar muito juntos, aprender nunca foi tão fácil!",
  mascoteSrc = "/images/mascote.png"
}: BannerProps) {
  return (
    <S.Container>
      <S.Mascote src={mascoteSrc} alt="Mascote Studo Jurata" />

      <S.Content>
        <S.Titulo>{titulo}</S.Titulo>
        <S.Subtitulo>{subtitulo}</S.Subtitulo>
      </S.Content>
    </S.Container>
  )
}