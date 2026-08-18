import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  titulo?: string
  icon?: ReactNode
  actions?: ReactNode
  /** Remove o padding interno — útil quando o filho é uma tabela. */
  semPadding?: boolean
  /**
   * Confirmado no Figma: em cards que agrupam "tiles" brancos internos
   * (estatísticas, conquistas, skins...), o corpo tem fundo cinza-lilás
   * (theme.colors.background) em vez de branco — é esse contraste que faz
   * os tiles internos se destacarem, em vez de ficarem "brancos sobre
   * brancos".
   */
  corpoComFundo?: boolean
  elevacao?: 'none' | 'default' | 'medium'
}
