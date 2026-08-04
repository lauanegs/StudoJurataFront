import { forwardRef, useId } from 'react'
import { X } from 'lucide-react'

import { Field } from '../Field'
import * as S from './styles'
import type { InputProps } from './types'

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    required,
    hint,
    error,
    icon,
    iconRight,
    onClear,
    mask,
    maxWidth,
    id,
    onChange,
    value,
    disabled,
    maxLength,
    ...rest
  },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  const counter =
    maxLength && typeof value === 'string' ? `${value.length}/${maxLength}` : undefined

  const showClear = Boolean(onClear) && Boolean(value) && !disabled

  return (
    <Field
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      counter={counter}
    >
      <S.Moldura $erro={Boolean(error)} $disabled={disabled} $maxWidth={maxWidth}>
        {icon && <S.Adorno aria-hidden="true">{icon}</S.Adorno>}

        <S.Controle
          id={fieldId}
          ref={ref}
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${fieldId}-error` : undefined}
          onChange={(event) => {
            if (mask) {
              event.target.value = mask(event.target.value)
            }
            onChange?.(event)
          }}
          {...rest}
        />

        {showClear && (
          <S.Adorno
            $clicavel
            role="button"
            tabIndex={0}
            aria-label="Limpar campo"
            onClick={onClear}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onClear?.()
            }}
          >
            <X />
          </S.Adorno>
        )}

        {iconRight && <S.Adorno aria-hidden="true">{iconRight}</S.Adorno>}
      </S.Moldura>
    </Field>
  )
})
