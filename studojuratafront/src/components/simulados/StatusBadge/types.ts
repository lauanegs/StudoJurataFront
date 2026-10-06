export type BadgeColor = 'purple' | 'green' | 'red' | 'gray' | 'blue'

export interface StatusBadgeProps {
  children: React.ReactNode
  color?: BadgeColor
  shape?: 'rectangle' | 'square' | 'circle'
  selected?: boolean
  onClick?: () => void
  ariaLabel?: string
  disabled?: boolean
}
