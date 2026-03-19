import * as S from './styles'
import type { CheckBoxProps } from './types'

export function CheckBox({
  label,
  checked,
  ...rest
}: CheckBoxProps) {
  return (
    <S.Container>
      <S.Input type="checkbox" checked={checked} {...rest} />
      {label && <S.Label>{label}</S.Label>}
    </S.Container>
  )
}