import { schemaResolver, useForm } from '@mantine/form'
import * as yup from 'yup'

import { dataFimNaoAnterior, inteiroPositivoObrigatorio } from './comum'
import { horaParaMinutos } from '../utils/format'
import type { DiaSemana, StatusMatricula } from '../types/turmas'

export interface DadosMatricula {
  dataInicio: string
  dataFim: string
  status: StatusMatricula
}

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

export interface DadosTurma {
  titulo: string
  cursoId: number | null
  capacidadeMaxima: string
  dataInicio: string
  dataFim: string
  ativa: boolean
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

export type FormularioTurma = ReturnType<typeof useFormularioTurma>

export interface DadosHorarioTurma {
  diaSemana: DiaSemana | null
  /** HH:mm, no formato do TimePicker. */
  horaInicio: string
  horaFim: string
}

/**
 * O horário é salvo assim que é adicionado, sem passar pelo Salvar do
 * cabeçalho, por isso tem schema próprio: sem ele o usuário só descobria o
 * campo faltando pelo toast, depois de clicar em Adicionar.
 */
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

export type FormularioHorarioTurma = ReturnType<typeof useFormularioHorarioTurma>

export interface DadosVinculoTurma {
  disciplinaId: number | null
  /** Opcional de propósito: a turma pode ser organizada antes de definir o professor. */
  professorId: number | null
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

export type FormularioVinculoTurma = ReturnType<typeof useFormularioVinculoTurma>
