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
  // O back só aceita simulado de professor com disciplina e turma no escopo
  // dele (sem isso a escrita é recusada como "sem escopo verificável") — a
  // validação da tela precisa exigir os dois para o professor não bater em 403
  // no fim do preenchimento.
  disciplinaId: yup.number().nullable().required('Selecione a disciplina'),
  turmaId: yup
    .number()
    .nullable()
    .when('tipoDestinacao', {
      is: 'ESPECIFICO',
      then: (schema) => schema.required('Selecione a turma para escolher os alunos'),
      otherwise: (schema) => schema.required('Selecione a turma'),
    }),
  // O plano é o que liga o simulado ao conteúdo da turma: o back exige um plano
  // do mesmo par turma+disciplina (SimuladoAccessGuard.garantirPlanoCompativel).
  planoEnsinoId: yup.number().nullable().required('Selecione o plano de ensino'),
  // Janela de aplicação: o back recusa simulado sem data de início
  // (SimuladoService.validarCamposDoSimulado).
  dataInicio: yup.string().required('Informe a data de início'),
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
