import type { Parentesco } from '@/dominios/pessoas/types'

export interface ItemVinculo {
  chave: string
  nome: string
  parentesco?: Parentesco | null
}

export interface VinculoResponsavelAlunoProps {
  titulo: string
  rotuloCampo: 'Responsável' | 'Aluno'
  opcoes: { value: number; label: string; descricao?: string }[]
  carregandoOpcoes?: boolean
  itens: ItemVinculo[]
  carregandoItens?: boolean
  erroItens?: string | null
  onRecarregar?: () => void
  desabilitado?: boolean
  aoVincular: (id: number, parentesco: Parentesco) => Promise<void> | void
  aoRemover: (item: ItemVinculo) => void
  aoVer?: (item: ItemVinculo) => void
}
