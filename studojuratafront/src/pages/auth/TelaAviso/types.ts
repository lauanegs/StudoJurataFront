import type { ReactNode } from 'react'

export interface TelaAvisoProps {
  icone: ReactNode
  corIcone: string
  fundoIcone: string
  titulo: string
  descricao: string
  larguraDescricao: string
  acao: ReactNode
}
