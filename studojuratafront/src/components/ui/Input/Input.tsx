import { forwardRef, useId, useState } from 'react'
import { CloseButton, Input as MantineInput, PasswordInput as MantinePasswordInput } from '@mantine/core'
import { Eye, EyeOff } from 'lucide-react'

import { Field } from '../Field'
import { theme as tokens } from '../../../styles/theme'
import { corComOpacidade } from '../../../utils/corComOpacidade'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { InputProps } from './types'

/**
 * A moldura de rótulo/erro/contador continua sendo o <Field> compartilhado
 * com Select, TextArea e DatePicker — só a caixa de digitação em si passou a
 * ser o Input da Mantine, pra manter os campos visualmente iguais enquanto
 * os outros ainda não foram migrados.
 *
 * Confirmado no Figma: a borda fica em opacidade reduzida parada e só fica
 * sólida quando o campo ganha foco — por isso o `useState` de foco aqui.
 */
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

  const estiloCampo = {
    input: {
      minHeight: altura,
      borderWidth: '2px',
      borderColor: error
        ? corComOpacidade(tokens.colors.error, emFoco || bordaSolida ? 1 : 0.45)
        : corComOpacidade(corBase, emFoco || bordaSolida ? 1 : 0.45),
      boxShadow: tokens.shadow.base,
      transition: `border-color ${tokens.transition.base}`,
    },
  }

  // type="password" + alternarVisibilidade usa o PasswordInput da Mantine
  // por baixo — é o único jeito de ter o botão de mostrar/esconder senha já
  // acessível (foco, aria) sem reimplementar à mão. Mantém a mesma moldura
  // (Field) e a mesma borda em opacidade reduzida fora do foco do Input comum.
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
        <MantinePasswordInput
          id={fieldId}
          ref={ref}
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          error={Boolean(error)}
          radius="md"
          style={{ maxWidth, ...style }}
          leftSection={comTamanho(icon, 18)}
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
      <MantineInput
        id={fieldId}
        ref={ref}
        type={type}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        error={Boolean(error)}
        radius="md"
        style={{ maxWidth, ...style }}
        leftSection={comTamanho(icon, 18)}
        rightSection={
          showClear ? (
            <CloseButton size="sm" aria-label="Limpar campo" onClick={onClear} />
          ) : (
            comTamanho(iconRight, 18)
          )
        }
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
          if (mask) {
            event.target.value = mask(event.target.value)
          }
          onChange?.(event)
        }}
        {...rest}
      />
    </Field>
  )
})
