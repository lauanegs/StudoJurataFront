import { useRef, type ChangeEvent } from 'react'
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
  // O elemento por trás do DatePickerInput/DateTimePicker é, ele mesmo, um
  // <button> — clicar em qualquer parte dele já abre o calendário. O ícone
  // decorativo (leftSection), porém, tem pointer-events desligado por
  // padrão, então clicar exatamente em cima dele não fazia nada — quebra o
  // hábito de "clicar no ícone pra abrir" que outros seletores já têm.
  // Ligando o pointer-events e disparando um clique programático no botão
  // real por trás, o ícone passa a funcionar como atalho pro mesmo gatilho.
  const gatilhoRef = useRef<HTMLButtonElement>(null)

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

  // A largura da área do ícone segue o `--input-height` interno (ligado ao
  // `size`, não à altura sobrescrita em `estilos.input` acima) — por isso
  // usa a prop oficial `leftSectionWidth` (não dá pra sobrescrever só via
  // `styles`, porque essa variável também controla o padding do texto).
  const larguraSecao = '56px'

  const iconeCalendario = (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      disabled={disabled}
      onClick={() => gatilhoRef.current?.click()}
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
      {comTamanho(<Calendar />, 18)}
    </button>
  )

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      {modo === 'data' ? (
        <DatePickerInput
          ref={gatilhoRef}
          id={id}
          value={(value as string) || null}
          onChange={disparar}
          placeholder={placeholder ?? 'Selecionar data...'}
          disabled={disabled}
          error={Boolean(error)}
          valueFormat={FORMATO_EXIBICAO.data}
          leftSection={iconeCalendario}
          leftSectionWidth={larguraSecao}
          leftSectionPointerEvents="auto"
          clearable
          radius="md"
          style={{ maxWidth }}
          styles={estilos}
        />
      ) : (
        <DateTimePicker
          ref={gatilhoRef}
          id={id}
          value={(value as string) || null}
          onChange={disparar}
          placeholder={placeholder ?? 'Selecionar data e horário...'}
          disabled={disabled}
          error={Boolean(error)}
          valueFormat={FORMATO_EXIBICAO.dataHora}
          leftSection={iconeCalendario}
          leftSectionWidth={larguraSecao}
          leftSectionPointerEvents="auto"
          clearable
          radius="md"
          style={{ maxWidth }}
          styles={estilos}
        />
      )}
    </Field>
  )
}
