import * as S from './styles'
import type { TagProps } from './types'

/** As cores vêm de *_VARIANT em utils/labels.ts. */
export function Tag({ children, variant = 'neutral', icon, ponto, size = 'medium' }: TagProps) {
  return (
    <S.Container $variant={variant} $size={size}>
      {ponto && <S.Ponto aria-hidden="true" />}
      {icon}
      {children}
    </S.Container>
  )
}
