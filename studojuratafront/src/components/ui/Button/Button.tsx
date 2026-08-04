import * as S from './styles'
import type { ButtonProps } from './types'

export function Button({
  children,
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const content = children ?? label

  return (
    <S.Container
      type={type}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <S.Content $hidden={loading}>
        {icon && <S.Icon aria-hidden="true">{icon}</S.Icon>}
        {content}
        {iconRight && <S.Icon aria-hidden="true">{iconRight}</S.Icon>}
      </S.Content>

      {loading && <S.Spinner aria-hidden="true" />}
    </S.Container>
  )
}
