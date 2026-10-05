import { Tela, Banner, Gradiente, ImagemBanner, Recorte, Conteudo } from './styles'
import type { TelaComBannerProps } from './types'

const bannerLogin = '/images/bannerLogin.png'

/*
 * Recorte da mordida branca ao redor do logo, extraído do próprio asset do
 * Figma (node "1:3283", "Vector 1") — canal alfa invertido: branco opaco só
 * onde o design tinha o "buraco", transparente no resto. Fica em cima do
 * retângulo colorido, com tamanho FIXO (não em %), pra não esticar/encolher
 * com a responsividade — só o retângulo por baixo é que acompanha a largura
 * da tela; a mordida em si mantém sempre a proporção original do Figma.
 */
const curvaLogoRecorte = '/images/curvaLogoRecorte.png'

/** Casca das telas de entrada (login e escolha do curso): faixa colorida com a mordida do logo e conteúdo centralizado. */
export function TelaComBanner({ children }: TelaComBannerProps) {
  return (
    <Tela>
      <Banner aria-hidden="true">
        <Gradiente />
        <ImagemBanner src={bannerLogin} alt="" />
        <Recorte src={curvaLogoRecorte} alt="" />
      </Banner>

      <Conteudo>{children}</Conteudo>
    </Tela>
  )
}
