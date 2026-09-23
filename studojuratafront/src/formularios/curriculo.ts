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

export interface DadosGradeCurso {
  disciplinaId: number | null
  cargaHoraria: string
}

/**
 * Linha da grade curricular do curso. Tem schema próprio porque é salva ao
 * clicar em "Adicionar", sem passar pelo Salvar do cabeçalho: sem ele o campo
 * faltando só aparecia por toast, depois do clique.
 */
export const gradeCursoSchema = yup.object({
  disciplinaId: yup.number().nullable().required('Selecione a disciplina'),
  cargaHoraria: yup
    .string()
    .required('Informe a carga horária')
    .test('carga', 'Informe uma carga horária maior que zero', (valor) => {
      const horas = Number(valor)
      return Number.isFinite(horas) && horas > 0
    }),
})

export function useFormularioGradeCurso() {
  return useForm<DadosGradeCurso>({
    initialValues: { disciplinaId: null, cargaHoraria: '' },
    validate: schemaResolver(gradeCursoSchema),
    validateInputOnBlur: true,
  })
}

export type FormularioGradeCurso = ReturnType<typeof useFormularioGradeCurso>
