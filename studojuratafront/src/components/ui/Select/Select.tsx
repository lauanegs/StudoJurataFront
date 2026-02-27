import { useState } from 'react'
import * as S from './styles'
import type { SelectProps, Option } from './types'
import { ChevronDown } from 'lucide-react'

export function Select({ options, value, onChange, placeholder = "Selecione..." }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedOption = options.find(opt => opt.value === value)

  const handleSelect = (option: Option) => {
    onChange?.(option.value)
    setIsOpen(false)
  }

  return (
    <S.Container>
      <S.SelectTrigger onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown 
          size={20} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: '0.2s' 
          }} 
        />
      </S.SelectTrigger>

      {isOpen && (
        <S.OptionsList>
          {options.map((option) => (
            <S.OptionItem
              key={option.value}
              isSelected={option.value === value}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </S.OptionItem>
          ))}
        </S.OptionsList>
      )}
    </S.Container>
  )
}