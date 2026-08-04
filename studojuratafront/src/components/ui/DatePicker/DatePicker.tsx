import { Calendar } from 'lucide-react'

import { Input } from '../Input'
import type { DatePickerProps } from './types'

/**
 * Campo de data. `modo="dataHora"` produz o formato que o back espera nos
 * campos LocalDateTime (Evento.dataHorario, Simulado.dataInicio/dataFim).
 */
export function DatePicker({ modo = 'data', ...resto }: DatePickerProps) {
  return <Input type={modo === 'data' ? 'date' : 'datetime-local'} icon={<Calendar />} {...resto} />
}
