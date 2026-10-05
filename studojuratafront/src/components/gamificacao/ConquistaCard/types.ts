export interface ConquistaCardProps {
  titulo: string
  descricao: string
  conquistada?: boolean
  /** Ex.: "2 de 3" — progresso rumo à conquista. */
  progresso?: string
}
