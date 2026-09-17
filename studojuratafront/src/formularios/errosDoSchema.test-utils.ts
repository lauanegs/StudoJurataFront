import { ValidationError, type AnyObject, type ObjectSchema } from 'yup'

/** Valida e devolve { campo: primeira mensagem }, como o schemaResolver mostra na tela — vazio quando válido. */
export async function errosDoSchema(schema: ObjectSchema<AnyObject>, dados: AnyObject) {
  try {
    await schema.validate(dados, { abortEarly: false })
    return {}
  } catch (erro) {
    if (!(erro instanceof ValidationError)) throw erro
    const erros: Record<string, string> = {}
    for (const item of erro.inner) if (item.path) erros[item.path] ??= item.message
    return erros
  }
}
