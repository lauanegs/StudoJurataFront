import type { FormularioPessoa } from '@/dominios/pessoas/formulario'

export interface PessoaCamposProps {
  form: FormularioPessoa
  disabled?: boolean
  rotuloNome?: string
  secao?: 'dados' | 'endereco'
  /** No cadastro de aluno a data de nascimento é obrigatória (ver formularios/pessoas). */
  exigirDataNascimento?: boolean
}
