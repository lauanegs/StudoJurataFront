import type { CSSProperties } from 'react'
import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'

export const estilosCampo = (error?: string) => ({
  input: {
    height: '56px',
    minHeight: '56px',
    borderWidth: '2px',
    borderColor: error ? tokens.colors.error : tokens.colors.buttonPurple,
    boxShadow: tokens.shadow.base,
  },
})

export const estiloLarguraMaxima = (maxWidth?: string): CSSProperties => ({ maxWidth })

export const estiloCampoData: CSSProperties = { flex: 2, minWidth: 0 }

export const estiloCampoHora: CSSProperties = { flex: 1, minWidth: '128px' }

export const LinhaDataHora = styled.div<{ $maxWidth?: string }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  max-width: ${({ $maxWidth }) => $maxWidth ?? 'none'};
`

export const IconeClicavel = styled.span<{ $desabilitado?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: ${({ $desabilitado }) => ($desabilitado ? 'default' : 'pointer')};
`
