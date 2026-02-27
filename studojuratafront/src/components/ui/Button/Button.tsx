import * as S from './styles'
import type { ButtonProps } from './types'

export function Button({
  label = "Registrar aula",
  ...rest
}: ButtonProps) {
  return (
    <S.Container {...rest}>
      <S.Label>{label}</S.Label>
    </S.Container>
  )
}