import { Group, Radio, Stack } from '@mantine/core'

import { Field } from '@/components/ui/Field'
import { theme as tokens } from '@/styles/theme'
import { Descricao, estilosRadio, RotuloComDescricao } from './styles'
import type { RadioGroupProps } from './types'

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
              styles={estilosRadio(Boolean(error))}
              label={
                option.description ? (
                  <RotuloComDescricao>
                    <span>{option.label}</span>
                    <Descricao>{option.description}</Descricao>
                  </RotuloComDescricao>
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
