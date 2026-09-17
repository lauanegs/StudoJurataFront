import { schemaResolver, useForm } from '@mantine/form'
import * as yup from 'yup'

import { dataFimNaoAnterior, inteiroPositivoOpcional } from './comum'
import type { StatusMatricula } from '../types/turmas'

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

const turmaSchema = yup.object({
  titulo: yup.string().trim().required('Informe o nome da turma'),
  cursoId: yup.number().nullable().required('Selecione o curso'),
  capacidadeMaxima: inteiroPositivoOpcional('Informe um número inteiro maior que zero'),
  dataFim: dataFimNaoAnterior('dataInicio'),
})

export function useFormularioTurma() {
  return useForm<DadosTurma>({
    initialValues: { titulo: '', cursoId: null, capacidadeMaxima: '', dataInicio: '', dataFim: '', ativa: true },
    validate: schemaResolver(turmaSchema),
  })
}

export type FormularioTurma = ReturnType<typeof useFormularioTurma>
