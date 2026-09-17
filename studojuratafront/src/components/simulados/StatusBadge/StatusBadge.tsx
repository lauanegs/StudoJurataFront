import * as S from './styles'
import type { StatusBadgeProps } from './types'

export function StatusBadge({
  children,
  color = 'purple',
  shape = 'rectangle',
  selected,
  onClick,
  ariaLabel,
  disabled,
}: StatusBadgeProps) {
  return (
    <S.Container
      as={onClick ? 'button' : 'span'}
      type={onClick ? 'button' : undefined}
      $color={color}
      $shape={shape}
      $selected={selected}
      $clickable={Boolean(onClick)}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={selected ? 'true' : undefined}
      onClick={onClick}
    >
      {children}
    </S.Container>
  )
}
