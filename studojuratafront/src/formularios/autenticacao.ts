import { schemaResolver, useForm } from '@mantine/form'
import * as yup from 'yup'

const loginSchema = yup.object({
  username: yup.string().trim().required('Informe seu usuário'),
  senha: yup.string().required('Informe sua senha'),
})

export function useFormularioLogin() {
  return useForm({
    initialValues: { username: '', senha: '' },
    validate: schemaResolver(loginSchema),
  })
}
