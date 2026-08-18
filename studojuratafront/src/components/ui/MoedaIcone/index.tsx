interface MoedaIconeProps {
  /** Mesma interface dos ícones lucide — permite passar por `comTamanho` sem tratamento especial. */
  size?: number
  className?: string
  'aria-hidden'?: React.AriaAttributes['aria-hidden']
}

/**
 * Substitui o ícone genérico `Coins` (lucide) nos lugares que falam de
 * moedas da gamificação — a moeda ilustrada do jogo pesa mais que um ícone
 * de contorno linear.
 */
export function MoedaIcone({ size = 16, className, ...rest }: MoedaIconeProps) {
  return (
    <img
      src="/images/moeda.png"
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, objectFit: 'contain' }}
      {...rest}
    />
  )
}
