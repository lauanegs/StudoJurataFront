import { forwardRef, useId, useState } from 'react'
import { CloseButton, Input as MantineInput, PasswordInput as MantinePasswordInput } from '@mantine/core'
import { Eye, EyeOff } from 'lucide-react'

import { Field } from '@/components/ui/Field'
import { theme as tokens } from '@/styles/theme'
import { comTamanho } from '@/utils/redimensionarIcone'
import { estilosCampo, LarguraMaxima } from './styles'
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
    corDestaque,
    altura = '56px',
    bordaSolida = false,
    alternarVisibilidade = false,
    id,
    type,
    onChange,
    onFocus,
    onBlur,
    value,
    disabled,
    maxLength,
    style,
    mostrarContador = true,
    ...rest
  },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const [emFoco, setEmFoco] = useState(false)

  const counter =
    mostrarContador && maxLength && typeof value === 'string'
      ? `${value.length}/${maxLength}`
      : undefined

  const showClear = Boolean(onClear) && Boolean(value) && !disabled
  const corBase = corDestaque ?? tokens.colors.buttonPurple

  const estiloCampo = estilosCampo({ altura, corBase, temErro: Boolean(error), destacada: emFoco || bordaSolida })

  const larguraSecao = altura

  if (type === 'password' && alternarVisibilidade) {
    return (
      <Field
        label={label}
        htmlFor={fieldId}
        required={required}
        hint={hint}
        error={error}
        counter={counter}
      >
        <LarguraMaxima $maxWidth={maxWidth}>
          <MantinePasswordInput
            id={fieldId}
            ref={ref}
            value={value}
            disabled={disabled}
            maxLength={maxLength}
            error={Boolean(error)}
            radius="md"
            style={style}
            leftSection={comTamanho(icon, 18)}
            leftSectionWidth={icon ? larguraSecao : undefined}
            rightSectionWidth={larguraSecao}
            visibilityToggleIcon={({ reveal }) => (reveal ? <EyeOff size={18} /> : <Eye size={18} />)}
            visibilityToggleButtonProps={{ 'aria-label': 'Alternar visibilidade da senha' }}
            aria-invalid={error ? true : undefined}
            aria-errormessage={error ? `${fieldId}-error` : undefined}
            onFocus={(evento) => {
              setEmFoco(true)
              onFocus?.(evento)
            }}
            onBlur={(evento) => {
              setEmFoco(false)
              onBlur?.(evento)
            }}
            styles={estiloCampo}
            onChange={onChange}
            {...rest}
          />
        </LarguraMaxima>
      </Field>
    )
  }

  return (
    <Field
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      counter={counter}
    >
      <LarguraMaxima $maxWidth={maxWidth}>
        <MantineInput
          id={fieldId}
          ref={ref}
          type={type}
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          error={Boolean(error)}
          radius="md"
          style={style}
          leftSection={comTamanho(icon, 18)}
          leftSectionWidth={icon ? larguraSecao : undefined}
          rightSection={
            showClear ? (
              <CloseButton size="sm" aria-label="Limpar campo" onClick={onClear} />
            ) : (
              comTamanho(iconRight, 18)
            )
          }
          rightSectionWidth={showClear || iconRight ? larguraSecao : undefined}
          rightSectionPointerEvents={showClear || iconRight ? 'auto' : 'none'}
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${fieldId}-error` : undefined}
          onFocus={(evento) => {
            setEmFoco(true)
            onFocus?.(evento)
          }}
          onBlur={(evento) => {
            setEmFoco(false)
            onBlur?.(evento)
          }}
          styles={estiloCampo}
          onChange={(event) => {
            if (mask && event.target.value) {
              event.target.value = mask(event.target.value)
            }
            onChange?.(event)
          }}
          {...rest}
        />
      </LarguraMaxima>
    </Field>
  )
})
