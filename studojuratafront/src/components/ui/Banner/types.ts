import type { ReactNode } from 'react'

export interface BannerProps {
  titulo?: string
  subtitulo?: string
  mascoteSrc?: string
  /** Slot à direita: contador de moedas, ação rápida. */
  extra?: ReactNode
}
