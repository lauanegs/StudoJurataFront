import { useRef, type ChangeEvent } from 'react'
import { TimePicker as MantineTimePicker } from '@mantine/dates'
import { Clock } from 'lucide-react'

import { Field } from '../Field'
import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { TimePickerProps } from './types'

/** Seletor de hora (HH:mm) com dropdown de rolagem. */
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
  // O dropdown só abre com foco no campo de horas e o ícone não recebe
  // clique; focar o campo pelo ícone mantém o "clicar no ícone para abrir".
  const horasRef = useRef<HTMLInputElement>(null)

  function disparar(novoValor: string) {
    onChange?.({ target: { value: novoValor } } as ChangeEvent<HTMLInputElement>)
  }

  const iconeRelogio = (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      disabled={disabled}
      onClick={() => horasRef.current?.focus()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 0,
        background: 'none',
        border: 'none',
        color: 'inherit',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {comTamanho(<Clock />, 18)}
    </button>
  )

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <MantineTimePicker
        id={id}
        value={(value as string) ?? ''}
        onChange={disparar}
        disabled={disabled}
        error={Boolean(error)}
        withDropdown
        hoursRef={horasRef}
        leftSection={iconeRelogio}
        leftSectionWidth="56px"
        leftSectionPointerEvents="auto"
        radius="md"
        style={{ maxWidth }}
        styles={{
          input: {
            height: '56px',
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
