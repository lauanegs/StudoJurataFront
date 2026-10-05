export interface SimuladoIniciarCardProps {
  /** O destaque do card é a disciplina, não o título do simulado. */
  disciplina: string
  /** Quem elaborou o simulado (professor ou "Studo Jurata" quando gerado pela IA). */
  autor?: string
  quantidadeQuestoes?: number | null
  /** Bloqueia o início (fora da janela de data, por exemplo). */
  indisponivel?: boolean
  motivoIndisponivel?: string
  loading?: boolean
  onStart?: () => void
}
