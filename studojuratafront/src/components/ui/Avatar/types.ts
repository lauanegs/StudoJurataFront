export interface AvatarProps {
  nome?: string | null
  src?: string | null
  size?: 'small' | 'medium' | 'large' | 'extraLarge'
  /** Anel colorido em volta (destaque de aniversariante, skin equipada). */
  destaque?: boolean
}
