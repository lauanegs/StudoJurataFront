import { useId, useState } from 'react'
import { Textarea as MantineTextarea } from '@mantine/core'

import { Field } from '../Field'
import { theme as tokens } from '../../../styles/theme'
import { corComOpacidade } from '../../../utils/corComOpacidade'
import type { TextAreaProps } from './types'

/**
 * O crescimento automático (`autoAltura`) era um useLayoutEffect ajustando
 * scrollHeight na mão — a Mantine já resolve isso nativamente via `autosize`.
 */
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
        styles={{
          input: {
            minHeight: '96px',
            padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
            borderWidth: '2px',
            borderColor: error
              ? corComOpacidade(tokens.colors.error, emFoco ? 1 : 0.45)
              : corComOpacidade(tokens.colors.buttonPurple, emFoco ? 1 : 0.45),
            boxShadow: tokens.shadow.base,
            transition: `border-color ${tokens.transition.base}`,
          },
        }}
        {...rest}
      />
    </Field>
  )
}
