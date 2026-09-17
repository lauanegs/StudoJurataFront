import { schemaResolver, useForm } from '@mantine/form'
import * as yup from 'yup'

import { inteiroPositivoOpcional, numeroPositivoOpcional } from './comum'
import type { TipoDestinacaoSimulado } from '../types/simulados'

export const MENSAGEM_DATA_FIM_SIMULADO = 'A data final deve ser posterior à inicial'

/** No simulado a data final precisa ser estritamente posterior (mesmo instante não abre janela). */
export function dataFimSimuladoValida(dataInicio: string, dataFim: string) {
  return !dataInicio || !dataFim || new Date(dataFim) > new Date(dataInicio)
}

export interface DadosSimulado {
  titulo: string
  disciplinaId: number | null
  turmaId: number | null
  planoEnsinoId: number | null
  tipoDestinacao: TipoDestinacaoSimulado
  dataInicio: string
  dataFim: string
  tempoLimite: string
  notaMaxima: string
}

export const simuladoSchema = yup.object({
  titulo: yup.string().trim().required('Informe o título do simulado'),
  turmaId: yup
    .number()
    .nullable()
    .when('tipoDestinacao', {
      is: 'ESPECIFICO',
      then: (schema) => schema.required('Selecione a turma para escolher os alunos'),
    }),
  tempoLimite: inteiroPositivoOpcional('Informe os minutos como número inteiro positivo'),
  notaMaxima: numeroPositivoOpcional('A nota máxima deve ser maior que zero'),
  dataFim: yup.string().test('intervalo', MENSAGEM_DATA_FIM_SIMULADO, function (dataFim) {
    return dataFimSimuladoValida(this.parent.dataInicio, dataFim ?? '')
  }),
})

export function useFormularioSimulado() {
  return useForm<DadosSimulado>({
    initialValues: {
      titulo: '',
      disciplinaId: null,
      turmaId: null,
      planoEnsinoId: null,
      tipoDestinacao: 'TODOS',
      dataInicio: '',
      dataFim: '',
      tempoLimite: '',
      notaMaxima: '10',
    },
    validate: schemaResolver(simuladoSchema),
  })
}

export type FormularioSimulado = ReturnType<typeof useFormularioSimulado>
