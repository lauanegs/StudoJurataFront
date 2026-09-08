import { useRef, type ChangeEvent } from 'react'
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
  // O dropdown do TimePicker abre quando o campo de horas ganha foco (não
  // tem um "abrir" imperativo próprio) — o ícone decorativo (leftSection)
  // não reage a clique por padrão (pointer-events desligado), quebrando o
  // hábito de "clicar no ícone pra abrir" que outros seletores já têm.
  // Focando o campo de horas na mão a partir do clique no ícone reproduz o
  // mesmo efeito.
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
