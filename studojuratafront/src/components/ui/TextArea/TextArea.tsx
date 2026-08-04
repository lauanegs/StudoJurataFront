import { useCallback, useId, useLayoutEffect, useRef } from 'react'

import { Field } from '../Field'
import * as S from './styles'
import type { TextAreaProps } from './types'

export function TextArea({
  label,
  required,
  hint,
  error,
  autoAltura = false,
  id,
  value,
  maxLength,
  disabled,
  onChange,
  rows = 4,
  ...rest
}: TextAreaProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const ref = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const element = ref.current
    if (!element || !autoAltura) return

    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }, [autoAltura])

  useLayoutEffect(adjustHeight, [value, adjustHeight])

  const counter =
    maxLength && typeof value === 'string' ? `${value.length}/${maxLength}` : undefined

  return (
    <Field
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      counter={counter}
    >
      <S.Moldura $erro={Boolean(error)} $disabled={disabled}>
        <S.Controle
          id={fieldId}
          ref={ref}
          rows={rows}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          $autoAltura={autoAltura}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            onChange?.(event)
            adjustHeight()
          }}
          {...rest}
        />
      </S.Moldura>
    </Field>
  )
}
