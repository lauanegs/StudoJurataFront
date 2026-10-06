import { useId, useState } from 'react'
import { Textarea as MantineTextarea } from '@mantine/core'

import { Field } from '@/components/ui/Field'
import { estilosCampo } from './styles'
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
  onFocus,
  onBlur,
  rows = 4,
  ...rest
}: TextAreaProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const [emFoco, setEmFoco] = useState(false)

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
      <MantineTextarea
        id={fieldId}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onChange={onChange}
        rows={rows}
        autosize={autoAltura}
        minRows={rows}
        resize={autoAltura ? 'none' : 'vertical'}
        error={Boolean(error)}
        radius="md"
        onFocus={(evento) => {
          setEmFoco(true)
          onFocus?.(evento)
        }}
        onBlur={(evento) => {
          setEmFoco(false)
          onBlur?.(evento)
        }}
        styles={estilosCampo(Boolean(error), emFoco)}
        {...rest}
      />
    </Field>
  )
}
