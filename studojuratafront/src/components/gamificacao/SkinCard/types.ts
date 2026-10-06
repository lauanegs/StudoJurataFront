export type SkinState = 'equipped' | 'owned' | 'locked'

export interface SkinCardProps {
  nome: string
  imagem?: string | null
  custoMoedas: number
  state: SkinState
  moedasDisponiveis?: number
  processando?: boolean
  onBuy?: () => void
  onEquip?: () => void
}
