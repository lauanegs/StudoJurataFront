import type { MoedaIconeProps } from './types'

export function MoedaIcone({ size = 16, className, ...rest }: MoedaIconeProps) {
  return (
    <img
      src="/images/gamificacao/moeda.png"
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, objectFit: 'contain' }}
      {...rest}
    />
  )
}
