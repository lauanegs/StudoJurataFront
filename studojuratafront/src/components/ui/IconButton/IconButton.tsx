import * as S from './styles'
import type { IconButtonProps } from './types'

export function IconButton({
  label,
  acao,
  icon,
  variant = 'neutral',
  size = 'medium',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <S.Container
      type={type}
      $variant={variant}
      $size={size}
      aria-label={label}
      title={label}
      data-acao={acao ?? label}
      {...rest}
    >
      {icon}
    </S.Container>
  )
}
