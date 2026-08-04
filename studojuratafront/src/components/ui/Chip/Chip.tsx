import { X } from 'lucide-react'

import * as S from './styles'
import type { ChipProps } from './types'

export function Chip({
  children,
  icon,
  onRemove,
  rotuloRemover,
  variant = 'neutral',
  disabled,
}: ChipProps) {
  return (
    <S.Container $variant={variant} $disabled={disabled}>
      {icon}
      <S.Texto>{children}</S.Texto>

      {onRemove && (
        <S.Remover
          type="button"
          disabled={disabled}
          aria-label={rotuloRemover ?? `Remover ${String(children)}`}
          onClick={onRemove}
        >
          <X />
        </S.Remover>
      )}
    </S.Container>
  )
}
