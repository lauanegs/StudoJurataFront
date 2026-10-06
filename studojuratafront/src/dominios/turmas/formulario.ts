import { schemaResolver, useForm } from '@mantine/form'
import * as yup from 'yup'

import { dataFimNaoAnterior, inteiroPositivoObrigatorio } from '@/dominios/comum/formulario'
import { horaParaMinutos } from '@/utils/format'

import type { DadosMatricula, DadosTurma, DadosHorarioTurma, DadosVinculoTurma } from './types'
const matriculaSchema = yup.object({
  dataInicio: yup.string().required('Informe a data de início'),
  dataFim: dataFimNaoAnterior('dataInicio'),
})

export function useFormularioMatricula() {
  return useForm<DadosMatricula>({
    initialValues: { dataInicio: new Date().toISOString().slice(0, 10), dataFim: '', status: 'ATIVA' },
    validate: schemaResolver(matriculaSchema),
  })
}

export const turmaSchema = yup.object({
  titulo: yup.string().trim().required('Informe o nome da turma'),
  cursoId: yup.number().nullable().required('Selecione o curso'),
  capacidadeMaxima: inteiroPositivoObrigatorio('Informe a capacidade máxima', 'Informe um número inteiro maior que zero'),
  dataInicio: yup.string().required('Informe a data de início'),
  dataFim: dataFimNaoAnterior('dataInicio'),
})

export function useFormularioTurma() {
  return useForm<DadosTurma>({
    initialValues: { titulo: '', cursoId: null, capacidadeMaxima: '', dataInicio: '', dataFim: '', ativa: true },
    validate: schemaResolver(turmaSchema),
  })
}

export const horarioTurmaSchema = yup.object({
  diaSemana: yup.string().nullable().required('Selecione o dia da semana'),
  horaInicio: yup.string().required('Informe a hora de início'),
  horaFim: yup
    .string()
    .required('Informe a hora de término')
    .test('intervalo', 'A hora de término deve ser maior que a de início', function (fim) {
      const inicio = this.parent.horaInicio as string | undefined
      return !inicio || !fim || horaParaMinutos(fim) > horaParaMinutos(inicio)
    }),
})

export function useFormularioHorarioTurma() {
  return useForm<DadosHorarioTurma>({
    initialValues: { diaSemana: null, horaInicio: '', horaFim: '' },
    validate: schemaResolver(horarioTurmaSchema),
    validateInputOnBlur: true,
  })
}

export const vinculoTurmaSchema = yup.object({
  disciplinaId: yup.number().nullable().required('Selecione a disciplina'),
})

export function useFormularioVinculoTurma() {
  return useForm<DadosVinculoTurma>({
    initialValues: { disciplinaId: null, professorId: null },
    validate: schemaResolver(vinculoTurmaSchema),
  })
}

