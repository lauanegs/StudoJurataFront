import type { FormularioPessoa } from '@/dominios/pessoas/types'
export interface PessoaCamposProps {
  form: FormularioPessoa
  disabled?: boolean
  rotuloNome?: string
  secao?: 'dados' | 'endereco'
  exigirDataNascimento?: boolean
}
