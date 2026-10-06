import { useRef, type ChangeEvent, type FormEvent, type ReactNode, type RefObject } from 'react'
import { DateInput, TimePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import { Calendar, Clock } from 'lucide-react'

import { Field } from '@/components/ui/Field'
import { comTamanho } from '@/utils/redimensionarIcone'
import { FORMATO_API_DATA, FORMATO_API_DATA_HORA, dataDigitadaParaIso, dataIsoParaExibicao, mascararData } from './conversaoData'
import { estiloCampoData, estiloCampoHora, estiloLarguraMaxima, estilosCampo, IconeClicavel, LinhaDataHora } from './styles'
import type { DatePickerProps } from './types'

const FORMATO_SAIDA: Record<'data' | 'dataHora', string> = {
  data: FORMATO_API_DATA,
  dataHora: FORMATO_API_DATA_HORA,
}

const LARGURA_ICONE = '56px'

function aplicarMascara(evento: FormEvent<HTMLInputElement>) {
  evento.currentTarget.value = mascararData(evento.currentTarget.value)
}

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
    <IconeClicavel aria-hidden="true" onClick={() => campoRef.current?.focus()} $desabilitado={disabled}>
      {comTamanho(icon, 18)}
    </IconeClicavel>
  )
}

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
          onInput={aplicarMascara}
          leftSection={<IconeCampo icon={<Calendar />} campoRef={campoDataRef} disabled={disabled} />}
          leftSectionWidth={LARGURA_ICONE}
          leftSectionPointerEvents="auto"
          clearable
          radius="md"
          style={estiloLarguraMaxima(maxWidth)}
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
    if (!dataParte) return
    disparar(dayjs(`${dataParte} ${novaHora || '00:00'}`, 'YYYY-MM-DD HH:mm').format(FORMATO_SAIDA.dataHora))
  }

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <LinhaDataHora $maxWidth={maxWidth}>
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
          onInput={aplicarMascara}
          leftSection={<IconeCampo icon={<Calendar />} campoRef={campoDataRef} disabled={disabled} />}
          leftSectionWidth={LARGURA_ICONE}
          leftSectionPointerEvents="auto"
          clearable
          radius="md"
          style={estiloCampoData}
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
          style={estiloCampoHora}
          styles={estilosCampo(error)}
        />
      </LinhaDataHora>
    </Field>
  )
}
