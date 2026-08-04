import * as S from './styles'
import type { TabProps } from './types'

export function Tab<V extends string = string>({
  options,
  value,
  onChange,
  rotuloAcessivel = 'Seções da página',
}: TabProps<V>) {
  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const enabled = options.filter((option) => !option.disabled)
    if (enabled.length === 0) return

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const step = event.key === 'ArrowRight' ? 1 : -1
      const next = options[(index + step + options.length) % options.length]
      if (next && !next.disabled) onChange(next.value)
    }
  }

  return (
    <S.Container role="tablist" aria-label={rotuloAcessivel}>
      {options.map((option, index) => {
        const active = option.value === value

        return (
          <S.Item
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={option.disabled}
            $ativa={active}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {option.icon}
            {option.label}
            {option.contador !== undefined && option.contador > 0 && (
              <S.Contador $ativa={active}>{option.contador}</S.Contador>
            )}
          </S.Item>
        )
      })}
    </S.Container>
  )
}
