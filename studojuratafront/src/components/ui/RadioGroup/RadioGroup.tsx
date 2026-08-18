import { Group, Radio, Stack } from '@mantine/core'

import { Field } from '../Field'
import { theme as tokens } from '../../../styles/theme'
import { corComOpacidade } from '../../../utils/corComOpacidade'
import type { RadioGroupProps } from './types'

/**
 * Escolha única. Substitui o par de checkboxes "Feminino/Masculino" das telas
 * antigas — o back tem um único campo `sexo`, então dois checkboxes permitiam
 * um estado impossível (os dois marcados).
 */
export function RadioGroup<V extends string = string>({
  options,
  value,
  onChange,
  label,
  required,
  hint,
  error,
  direction = 'horizontal',
  name,
}: RadioGroupProps<V>) {
  const Layout = direction === 'horizontal' ? Group : Stack

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <Radio.Group name={name} value={value ?? null} onChange={(novoValor) => onChange(novoValor as V)}>
        <Layout gap={direction === 'horizontal' ? tokens.spacing.lg : tokens.spacing.xs} wrap="wrap">
          {options.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              color="brandPurple"
              aria-invalid={error ? true : undefined}
              styles={{
                radio: {
                  borderWidth: '2px',
                  borderColor: error
                    ? corComOpacidade(tokens.colors.error, 0.5)
                    : corComOpacidade(tokens.colors.buttonPurple, 0.35),
                },
              }}
              label={
                option.description ? (
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span>{option.label}</span>
                    <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textTertiary }}>
                      {option.description}
                    </span>
                  </span>
                ) : (
                  option.label
                )
              }
            />
          ))}
        </Layout>
      </Radio.Group>
    </Field>
  )
}
