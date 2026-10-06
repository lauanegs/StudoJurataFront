import type { FormularioPessoa } from '@/dominios/pessoas/formulario'

export interface PessoaCamposProps {
  form: FormularioPessoa
  disabled?: boolean
  rotuloNome?: string
  secao?: 'dados' | 'endereco'
  exigirDataNascimento?: boolean
}
