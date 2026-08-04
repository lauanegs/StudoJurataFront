import * as S from './styles'
import type { IconButtonProps } from './types'

/** Botão só com ícone. O `label` vira aria-label e title — nunca é opcional. */
export function IconButton({
  label,
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
      {...rest}
    >
      {icon}
    </S.Container>
  )
}
