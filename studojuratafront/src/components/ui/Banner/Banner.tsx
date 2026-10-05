import { Container, Conteudo, Mascote, Textos, Titulo, Subtitulo, Extra } from './styles'
import type { BannerProps } from './types'

export function Banner({
  titulo = 'Bem-vindo ao Studo Jurata!',
  subtitulo = 'Vamos estudar muito juntos, aprender nunca foi tão fácil!',
  mascoteSrc = '/images/mascote.png',
  extra,
}: BannerProps) {
  return (
    <Container>
      <Conteudo>
        <Mascote src={mascoteSrc} alt="" aria-hidden="true" />

        <Textos>
          <Titulo>{titulo}</Titulo>
          <Subtitulo>{subtitulo}</Subtitulo>
        </Textos>
      </Conteudo>

      {extra && <Extra>{extra}</Extra>}
    </Container>
  )
}
