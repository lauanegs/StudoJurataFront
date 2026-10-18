import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'
import type { CoresChip } from './types'

export const estilosChip = (cor: CoresChip, comRemover: boolean, desabilitado?: boolean) => ({
  root: {
    position: 'relative',
    backgroundColor: cor.bg,
    color: cor.texto,
    border: cor.borda ? `1px solid ${cor.borda}` : undefined,
    fontWeight: tokens.typography.weights.medium,
    fontSize: tokens.typography.sizes.sm,
    opacity: desabilitado ? 0.55 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    height: '56px',
    paddingInlineStart: comRemover ? tokens.spacing.xl : tokens.spacing.md,
    paddingInlineEnd: comRemover ? tokens.spacing.xl : tokens.spacing.md,
    maxWidth: '100%',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  remove: {
    position: 'absolute',
    right: tokens.spacing.xs,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    minWidth: '24px',
  },
} as const)

export const Conteudo = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`

export const Texto = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
