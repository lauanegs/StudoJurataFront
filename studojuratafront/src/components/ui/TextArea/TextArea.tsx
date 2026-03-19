import * as S from './styles'
import type { TextAreaProps } from './types'

export function TextArea({ ...rest }: TextAreaProps) {
  return (
    <S.Wrapper>
      <S.TextAreaElement {...rest} />
    </S.Wrapper>
  )
}