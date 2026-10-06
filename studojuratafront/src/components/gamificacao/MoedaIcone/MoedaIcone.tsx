import { Imagem } from './styles'
import type { MoedaIconeProps } from './types'

export function MoedaIcone({ size = 16, className, ...rest }: MoedaIconeProps) {
  return (
    <Imagem
      src="/images/gamificacao/moeda.png"
      alt=""
      width={size}
      height={size}
      className={className}
      {...rest}
    />
  )
}
