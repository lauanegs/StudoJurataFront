export interface AniversarianteCardProps {
  nome: string
  data: string
  /** Ex.: "faz 9 anos" — derivado de Pessoa.dataNascimento. Opcional: nem toda tela exibe a idade. */
  complemento?: string
  hoje?: boolean
  foto?: string | null
}
