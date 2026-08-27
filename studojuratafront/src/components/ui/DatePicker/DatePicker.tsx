import type { ChangeEvent } from 'react'
import { DatePickerInput, DateTimePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import { Calendar } from 'lucide-react'

import { Field } from '../Field'
import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { DatePickerProps } from './types'

const FORMATO_SAIDA: Record<'data' | 'dataHora', string> = {
  data: 'YYYY-MM-DD',
  dataHora: 'YYYY-MM-DDTHH:mm',
}

const FORMATO_EXIBICAO: Record<'data' | 'dataHora', string> = {
  data: 'DD/MM/YYYY',
  dataHora: 'DD/MM/YYYY HH:mm',
}

/**
 * Calendário de verdade (Mantine `DatePickerInput`/`DateTimePicker`) no lugar
 * do `<input type="date">` nativo do navegador. O valor que entra e sai daqui
 * continua sendo a mesma string ISO de sempre (`YYYY-MM-DD` ou
 * `YYYY-MM-DDTHH:mm`) — a Mantine devolve o valor num formato próprio
 * (`YYYY-MM-DD HH:mm:ss`), então a conversão é feita com dayjs pra nenhuma
 * tela precisar mudar como lê/escreve a data.
 */
export function DatePicker({
  modo = 'data',
  label,
  required,
  hint,
  error,
  value,
  onChange,
  disabled,
  id,
  placeholder,
  maxWidth,
}: DatePickerProps) {
  function disparar(novoValor: string | null) {
    const valorFinal = novoValor ? dayjs(novoValor).format(FORMATO_SAIDA[modo]) : ''
    onChange?.({ target: { value: valorFinal } } as ChangeEvent<HTMLInputElement>)
  }

  const estilos = {
    input: {
      height: '56px',
      minHeight: '56px',
      borderWidth: '2px',
      borderColor: error ? tokens.colors.error : tokens.colors.buttonPurple,
      boxShadow: tokens.shadow.base,
    },
  }

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      {modo === 'data' ? (
        <DatePickerInput
          id={id}
          value={(value as string) || null}
          onChange={disparar}
          placeholder={placeholder ?? 'Selecionar data...'}
          disabled={disabled}
          error={Boolean(error)}
          valueFormat={FORMATO_EXIBICAO.data}
          leftSection={comTamanho(<Calendar />, 18)}
          clearable
          radius="md"
          style={{ maxWidth }}
          styles={estilos}
        />
      ) : (
        <DateTimePicker
          id={id}
          value={(value as string) || null}
          onChange={disparar}
          placeholder={placeholder ?? 'Selecionar data e horário...'}
          disabled={disabled}
          error={Boolean(error)}
          valueFormat={FORMATO_EXIBICAO.dataHora}
          leftSection={comTamanho(<Calendar />, 18)}
          clearable
          radius="md"
          style={{ maxWidth }}
          styles={estilos}
        />
      )}
    </Field>
  )
}
