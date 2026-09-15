import { useRef, type ChangeEvent, type ReactNode, type RefObject } from 'react'
import { DateInput, TimePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Calendar, Clock } from 'lucide-react'

import { Field } from '../Field'
import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { DatePickerProps } from './types'

// Sem isso, `dayjs(valorDigitado, 'DD/MM/YYYY')` (usado abaixo em dateParser)
// ignora o formato passado — dayjs só respeita o 2º argumento com esse
// plugin habilitado — e cai no parser nativo do JS, que não entende
// DD/MM/YYYY (formato brasileiro). Sem esse parser próprio, o DateInput da
// Mantine tenta o parser dela mesma (`dateStringParser`), que também não bate
// certo com DD/MM/YYYY: digitar "15/10/2026" virava uma data completamente
// diferente e sumia ao sair do campo.
dayjs.extend(customParseFormat)

const FORMATO_SAIDA: Record<'data' | 'dataHora', string> = {
  data: 'YYYY-MM-DD',
  dataHora: 'YYYY-MM-DDTHH:mm',
}

const FORMATO_EXIBICAO_DATA = 'DD/MM/YYYY'

/** Só aceita o texto exatamente no formato DD/MM/YYYY (modo estrito) — evita o parser padrão da Mantine, que não é confiável pra esse formato. */
function analisarDataDigitada(texto: string): string | null {
  const data = dayjs(texto, FORMATO_EXIBICAO_DATA, true)
  return data.isValid() ? data.format('YYYY-MM-DD') : null
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
 * Calendário de verdade (Mantine `DateInput`/`TimeInput`) no lugar do
 * `<input type="date">` nativo do navegador. O valor que entra e sai daqui
 * continua sendo a mesma string ISO de sempre (`YYYY-MM-DD` ou
 * `YYYY-MM-DDTHH:mm`) — a Mantine devolve o valor num formato próprio, então
 * a conversão é feita com dayjs pra nenhuma tela precisar mudar como lê/
 * escreve a data.
 *
 * Confirmado pelo usuário: precisa dar pra DIGITAR a data/hora (não só
 * escolher no calendário), clicando no ícone OU digitando direto — mesmo
 * padrão nos dois campos. `DatePickerInput`/`DateTimePicker` (usados antes)
 * sempre renderizam um `<button>` por trás — nunca aceitam texto digitado, é
 * comportamento fixo da lib (`PickerInputBase`), não dá pra contornar via
 * prop. `DateInput`/`TimePicker` são os componentes digitáveis equivalentes
 * da Mantine (cada um com seu próprio dropdown ao clicar no ícone); pra
 * `dataHora`, como a Mantine não tem um único campo de data+hora, a solução
 * é combinar os dois lado a lado.
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
  // Refs pros campos (DateInput/TimePicker) — o ícone decorativo (leftSection)
  // foca no campo real pra abrir o dropdown dele, já que agora ambos são
  // inputs de verdade (não precisa mais do truque de "clicar num botão
  // escondido" que o DatePickerInput/DateTimePicker exigia).
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
          valueFormat={FORMATO_EXIBICAO_DATA}
          dateParser={analisarDataDigitada}
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
          valueFormat={FORMATO_EXIBICAO_DATA}
          dateParser={analisarDataDigitada}
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
