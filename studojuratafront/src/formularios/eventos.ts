import { schemaResolver, useForm } from '@mantine/form'
import * as yup from 'yup'

import { paraInputDataHora } from '../utils/format'
import type { Evento } from '../types/eventos'

export interface DadosEvento {
  dataHorario: string
  titulo: string
  descricao: string
  concluido: boolean
}

const eventoSchema = yup.object({
  titulo: yup.string().trim().required('Informe o título do evento'),
  dataHorario: yup.string().required('Informe a data e o horário'),
})

export function useFormularioEvento() {
  return useForm<DadosEvento>({
    initialValues: { dataHorario: '', titulo: '', descricao: '', concluido: false },
    validate: schemaResolver(eventoSchema),
    validateInputOnBlur: true,
  })
}

export function deEvento(evento: Evento): DadosEvento {
  return {
    dataHorario: paraInputDataHora(evento.dataHorario),
    titulo: evento.titulo,
    descricao: evento.descricao ?? '',
    concluido: evento.concluido,
  }
}
