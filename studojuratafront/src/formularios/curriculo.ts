import { schemaResolver, useForm } from '@mantine/form'
import * as yup from 'yup'

export interface DadosDisciplina {
  titulo: string
  ativa: boolean
}

const disciplinaSchema = yup.object({
  titulo: yup.string().trim().required('Informe o nome da disciplina'),
})

export function useFormularioDisciplina() {
  return useForm<DadosDisciplina>({
    initialValues: { titulo: '', ativa: true },
    validate: schemaResolver(disciplinaSchema),
    validateInputOnBlur: true,
  })
}

export interface DadosCurso {
  nome: string
  descricao: string
  ativo: boolean
}

const cursoSchema = yup.object({
  nome: yup.string().trim().required('Informe o nome do curso'),
})

export function useFormularioCurso() {
  return useForm<DadosCurso>({
    initialValues: { nome: '', descricao: '', ativo: true },
    validate: schemaResolver(cursoSchema),
    validateInputOnBlur: true,
  })
}
