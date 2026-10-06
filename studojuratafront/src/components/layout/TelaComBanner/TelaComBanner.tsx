import { Tela, Banner, Gradiente, ImagemBanner, Recorte, Conteudo } from './styles'
import type { TelaComBannerProps } from './types'

const bannerLogin = '/images/marca/banner-login.png'

const curvaLogoRecorte = '/images/marca/curva-logo-recorte.png'

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
