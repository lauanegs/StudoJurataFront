import { useEffect, useRef } from 'react'
import { Check, Minus } from 'lucide-react'

import * as S from './styles'
import type { CheckBoxProps } from './types'

export function CheckBox({
  label,
  description,
  error,
  indeterminate = false,
  checked = false,
  disabled,
  ...rest
}: CheckBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <S.Wrapper $hasError={Boolean(error)}>
      <S.Container $disabled={disabled}>
        <S.Input
          ref={inputRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          {...rest}
        />

        <S.Marker $checked={checked || indeterminate} $error={Boolean(error)} aria-hidden="true">
          {indeterminate ? <Minus /> : checked ? <Check /> : null}
        </S.Marker>

        {(label || description) && (
          <S.Content>
            {label && <S.Label>{label}</S.Label>}
            {description && <S.Description>{description}</S.Description>}
          </S.Content>
        )}
      </S.Container>

      {error && <S.Error role="alert">{error}</S.Error>}
    </S.Wrapper>
  )
}
