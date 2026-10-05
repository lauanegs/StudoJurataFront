export type SkinState = 'equipped' | 'owned' | 'locked'

export interface SkinCardProps {
  nome: string
  imagem?: string | null
  custoMoedas: number
  state: SkinState
  /** Saldo do aluno — define se o botão de compra fica habilitado. */
  moedasDisponiveis?: number
  processando?: boolean
  onBuy?: () => void
  onEquip?: () => void
}
