import type { ChangeEvent } from 'react'
import { TimePicker as MantineTimePicker } from '@mantine/dates'
import { Clock } from 'lucide-react'

import { Field } from '../Field'
import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { TimePickerProps } from './types'

/** Seletor de hora (HH:mm) com dropdown de rolagem — antes era `<input type="time">` nativo. */
export function TimePicker({
  label,
  required,
  hint,
  error,
  value,
  onChange,
  disabled,
  id,
  maxWidth,
}: TimePickerProps) {
  function disparar(novoValor: string) {
    onChange?.({ target: { value: novoValor } } as ChangeEvent<HTMLInputElement>)
  }

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <MantineTimePicker
        id={id}
        value={(value as string) ?? ''}
        onChange={disparar}
        disabled={disabled}
        error={Boolean(error)}
        withDropdown
        leftSection={comTamanho(<Clock />, 18)}
        radius="md"
        style={{ maxWidth }}
        styles={{
          input: {
            minHeight: '56px',
            borderWidth: '2px',
            borderColor: error ? tokens.colors.error : tokens.colors.buttonPurple,
            boxShadow: tokens.shadow.base,
          },
        }}
      />
    </Field>
  )
}
