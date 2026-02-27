import * as S from './styles'
import type { InputProps } from './types'
import { Search } from 'lucide-react'

export function Input({ ...rest }: InputProps) {
  return (
    <S.Wrapper>
      <S.IconContainer>
        <Search size={20} />
      </S.IconContainer>
      
      <S.InputElement 
        {...rest} 
      />
    </S.Wrapper>
  )
}