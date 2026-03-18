import * as S from './styles'
import type { TabProps } from './types'

export function Tab({
  options = [],
  value,
  onChange,
  ...rest
}: TabProps) {
  return (
    <S.Container {...rest}>
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <S.TabItem
            key={option.value}
            $active={isActive}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </S.TabItem>
        )
      })}
    </S.Container>
  )
}