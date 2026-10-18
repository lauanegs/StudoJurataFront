import { useRef, type ChangeEvent } from 'react'
import { Clock } from 'lucide-react'

import { Field } from '@/components/ui/Field'
import { estilosCampo } from '@/components/ui/DatePicker/styles'
import { comTamanho } from '@/utils/redimensionarIcone'
import { BotaoRelogio, CampoHorario } from './styles'
import type { TimePickerProps } from './types'

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
  const horasRef = useRef<HTMLInputElement>(null)

  function disparar(novoValor: string) {
    onChange?.({ target: { value: novoValor } } as ChangeEvent<HTMLInputElement>)
  }

  const iconeRelogio = (
    <BotaoRelogio type="button" tabIndex={-1} aria-hidden="true" disabled={disabled} onClick={() => horasRef.current?.focus()}>
      {comTamanho(<Clock />, 18)}
    </BotaoRelogio>
  )

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <CampoHorario
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
        $maxWidth={maxWidth}
        styles={estilosCampo(error)}
      />
    </Field>
  )
}
