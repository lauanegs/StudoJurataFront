export type TamanhoAvatar = 'small' | 'medium' | 'large' | 'extraLarge'

export interface AvatarProps {
  nome?: string | null
  src?: string | null
  size?: TamanhoAvatar
  destaque?: boolean
}
