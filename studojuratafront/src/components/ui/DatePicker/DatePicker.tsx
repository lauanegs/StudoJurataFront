import * as S from './styles'
import type { DatePickerProps } from './types'
import { Calendar } from 'lucide-react'
import { useRef } from 'react'

export function DatePicker({ ...rest }: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpenCalendar() {
    inputRef.current?.showPicker?.()
    inputRef.current?.focus()
  }

  return (
    <S.Wrapper>
      <S.IconContainer onClick={handleOpenCalendar}>
        <Calendar size={20} />
      </S.IconContainer>

      <S.InputElement
        ref={inputRef}
        type="date"
        {...rest}
      />
    </S.Wrapper>
  )
}