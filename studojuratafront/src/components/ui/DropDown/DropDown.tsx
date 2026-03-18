import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import * as S from './styles'
import type { DropDownProps } from './types'

export function DropDown({
  title,
  grade,
  items = [],
  defaultOpen = false,
  ...rest
}: DropDownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  function toggle() {
    setIsOpen(prev => !prev)
  }

  return (
    <S.Container {...rest}>
      <S.Header onClick={toggle}>
        <S.Title>{title}</S.Title>

        <S.RightContent>
          {grade && <S.Grade>{grade}</S.Grade>}
          <S.Icon isOpen={isOpen}>
            <ChevronDown size={18} />
          </S.Icon>
        </S.RightContent>
      </S.Header>

      {isOpen && (
        <S.Content>
          {items.map((item, index) => (
            <S.Item key={index}>
              <S.ItemLabel>{item.label}</S.ItemLabel>
              <S.ItemValue>{item.value}</S.ItemValue>
            </S.Item>
          ))}
        </S.Content>
      )}
    </S.Container>
  )
}