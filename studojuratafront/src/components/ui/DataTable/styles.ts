import type { CSSProperties } from 'react'
import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'
import type { Coluna, Densidade } from './types'

export const Envelope = styled.div`
  width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

export const Rolagem = styled.div`
  width: 100%;
  overflow-x: auto;
`

export const RotuloOrdenavel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`

export const estilosTabela = (densidade: Densidade) => ({
  table: { width: '100%' },
  thead: { background: corComOpacidade(tokens.colors.background, 0.3) },
  th: {
    padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semiBold,
    letterSpacing: '-0.8px',
    color: tokens.colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: `2px solid ${corComOpacidade(tokens.colors.textTertiary, 0.1)}` },
  td: {
    padding: `${densidade === 'compacta' ? tokens.spacing.xs : tokens.spacing.sm} ${tokens.spacing.lg}`,
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.textSecondary,
    verticalAlign: 'middle',
  },
} satisfies Record<string, CSSProperties>)

export const estiloCabecalhoColuna = <T,>(coluna: Coluna<T>): CSSProperties => ({
  width: coluna.largura,
  textAlign: coluna.alinhamento ?? 'left',
  cursor: coluna.ordenavel ? 'pointer' : undefined,
  userSelect: coluna.ordenavel ? 'none' : undefined,
})

export const estiloCabecalhoAcoes = (quebrarAcoes: boolean): CSSProperties =>
  quebrarAcoes ? { textAlign: 'left' } : { textAlign: 'left', width: '1%', whiteSpace: 'nowrap' }

export const estiloLinha = (clicavel: boolean, ultima: boolean): CSSProperties => ({
  cursor: clicavel ? 'pointer' : undefined,
  ...(ultima ? { borderBottom: 'none' } : null),
})

export const estiloCelula = <T,>(coluna: Coluna<T>): CSSProperties => ({ textAlign: coluna.alinhamento ?? 'left' })

export const estiloCelulaAcoes = (quebrarAcoes: boolean): CSSProperties =>
  quebrarAcoes ? { textAlign: 'left' } : { textAlign: 'left', whiteSpace: 'nowrap' }
