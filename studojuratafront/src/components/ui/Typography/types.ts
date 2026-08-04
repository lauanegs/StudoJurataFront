import type { ElementType, HTMLAttributes, ReactNode } from 'react'

export type TextVariant =
  | 'pageTitle'    // 32px Medium — título de tela (doc §6.2 H1)
  | 'displayTitle' // 32px Bold — banners de boas-vindas
  | 'subtitle'     // 20px Medium
  | 'largeNumber'  // 24px Bold — percentuais e contadores
  | 'sectionTitle' // 16px Semi Bold — cabeçalho de card/tabela
  | 'itemTitle'    // 18px Semi Bold — rótulo de matéria, letra de alternativa
  | 'body'         // 14px Regular
  | 'bodyStrong'   // 14px Medium
  | 'caption'      // 12px Regular
  | 'captionStrong' // 12px Semi Bold

export type TextTone = 'strong' | 'secondary' | 'tertiary' | 'purple' | 'blue' | 'success' | 'error' | 'warning' | 'white'

export interface TextoProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  tone?: TextTone
  /** Sobrescreve a tag HTML sem mudar o estilo. */
  as?: ElementType
  align?: 'left' | 'center' | 'right'
  /** Corta o texto em N linhas com reticências. */
  lines?: number
  children?: ReactNode
}
