import * as S from './styles'
import type { CardProps } from './types'

export function Card({
  children,
  ...rest
}: CardProps) {
  return (
    <S.Container {...rest}>
      {children}
    </S.Container>
  )
}