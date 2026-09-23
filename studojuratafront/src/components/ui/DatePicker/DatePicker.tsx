import { useRef, type ChangeEvent, type ReactNode, type RefObject } from 'react'
import { DateInput, TimePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import { Calendar, Clock } from 'lucide-react'

import { Field } from '../Field'
import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import { FORMATO_API_DATA, FORMATO_API_DATA_HORA, dataDigitadaParaIso, dataIsoParaExibicao } from './conversaoData'
import type { DatePickerProps } from './types'

const FORMATO_SAIDA: Record<'data' | 'dataHora', string> = {
  data: FORMATO_API_DATA,
  dataHora: FORMATO_API_DATA_HORA,
}

const estilosCampo = (error?: string) => ({
  input: {
    height: '56px',
    minHeight: '56px',
    borderWidth: '2px',
    borderColor: error ? tokens.colors.error : tokens.colors.buttonPurple,
    boxShadow: tokens.shadow.base,
  },
})

const LARGURA_ICONE = '56px'

/**
 * Componente à parte (não uma função chamada dentro do render do
 * `DatePicker`) só pra o ref cruzar a fronteira como prop — a forma
 * suportada de um clique disparar foco no input de verdade; ler `ref.current`
 * dentro de uma função comum, no meio do render de outro componente, é o que
 * a regra `react-hooks/refs` do projeto proíbe.
 */
function IconeCampo({
  icon,
  campoRef,
  disabled,
}: {
  icon: ReactNode
  campoRef: RefObject<HTMLInputElement | null>
  disabled?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      onClick={() => campoRef.current?.focus()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {comTamanho(icon, 18)}
    </span>
  )
}

/**
 * Entrada e saída continuam em string ISO (`YYYY-MM-DD` ou
 * `YYYY-MM-DDTHH:mm`); a conversão do formato da Mantine é feita aqui.
 *
 * Usa `DateInput`/`TimePicker` porque a data precisa ser digitável:
 * `DatePickerInput`/`DateTimePicker` renderizam um botão e não aceitam texto.
 * Como a Mantine não tem campo único de data+hora digitável, `dataHora`
 * combina os dois.
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
  // O ícone (leftSection) foca o campo para abrir o dropdown dele.
  const campoDataRef = useRef<HTMLInputElement>(null)
  const campoHoraRef = useRef<HTMLInputElement>(null)

  function disparar(valorFinal: string) {
    onChange?.({ target: { value: valorFinal } } as ChangeEvent<HTMLInputElement>)
  }

  if (modo === 'data') {
    return (
      <Field label={label} required={required} hint={hint} error={error}>
        <DateInput
          ref={campoDataRef}
          id={id}
          value={(value as string) || null}
          onChange={(novoValor) => disparar(novoValor ? dayjs(novoValor).format(FORMATO_SAIDA.data) : '')}
          placeholder={placeholder ?? 'Digitar ou selecionar data...'}
          disabled={disabled}
          error={Boolean(error)}
          valueFormat={dataIsoParaExibicao}
          dateParser={dataDigitadaParaIso}
          // Blur com o padrão da Mantine (fixOnBlur: true) reescreve o texto a
          // partir do valor: data digitada em formato aceito volta normalizada
          // como DD/MM/YYYY, e texto que não é data não fica parecendo
          // preenchido com o formulário vazio — o schema acusa no envio.
          leftSection={<IconeCampo icon={<Calendar />} campoRef={campoDataRef} disabled={disabled} />}
          leftSectionWidth={LARGURA_ICONE}
          leftSectionPointerEvents="auto"
          clearable
          radius="md"
          style={{ maxWidth }}
          styles={estilosCampo(error)}
        />
      </Field>
    )
  }

  const dataParte = value ? dayjs(value as string).format('YYYY-MM-DD') : null
  const horaParte = value ? dayjs(value as string).format('HH:mm') : ''

  function dispararData(novaData: string | null) {
    if (!novaData) {
      disparar('')
      return
    }
    disparar(dayjs(`${novaData} ${horaParte || '00:00'}`, 'YYYY-MM-DD HH:mm').format(FORMATO_SAIDA.dataHora))
  }

  function dispararHora(novaHora: string) {
    if (!dataParte) return // hora sozinha, sem data, não forma um valor válido — ver disabled abaixo
    disparar(dayjs(`${dataParte} ${novaHora || '00:00'}`, 'YYYY-MM-DD HH:mm').format(FORMATO_SAIDA.dataHora))
  }

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <div style={{ display: 'flex', gap: tokens.spacing.xs, maxWidth }}>
        <DateInput
          ref={campoDataRef}
          id={id}
          value={dataParte}
          onChange={dispararData}
          placeholder={placeholder ?? 'Data...'}
          disabled={disabled}
          error={Boolean(error)}
          valueFormat={dataIsoParaExibicao}
          dateParser={dataDigitadaParaIso}
          leftSection={<IconeCampo icon={<Calendar />} campoRef={campoDataRef} disabled={disabled} />}
          leftSectionWidth={LARGURA_ICONE}
          leftSectionPointerEvents="auto"
          clearable
          radius="md"
          style={{ flex: 2, minWidth: 0 }}
          styles={estilosCampo(error)}
        />
        <TimePicker
          hoursRef={campoHoraRef}
          aria-label="Horário"
          value={horaParte}
          onChange={dispararHora}
          withDropdown
          hoursPlaceholder="--"
          minutesPlaceholder="--"
          disabled={disabled || !dataParte}
          error={Boolean(error)}
          leftSection={<IconeCampo icon={<Clock />} campoRef={campoHoraRef} disabled={disabled} />}
          leftSectionWidth={LARGURA_ICONE}
          leftSectionPointerEvents="auto"
          radius="md"
          style={{ flex: 1, minWidth: '128px' }}
          styles={estilosCampo(error)}
        />
      </div>
    </Field>
  )
}
