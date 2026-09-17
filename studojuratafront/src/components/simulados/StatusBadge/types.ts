export type BadgeColor = 'purple' | 'green' | 'red' | 'gray' | 'blue'

export interface StatusBadgeProps {
  children: React.ReactNode
  color?: BadgeColor
  /** Badge quadrado usado na navegação de questões do simulado. */
  shape?: 'rectangle' | 'square' | 'circle'
  selected?: boolean
  onClick?: () => void
  ariaLabel?: string
  disabled?: boolean
}
