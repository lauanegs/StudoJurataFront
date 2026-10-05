import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'
import type { QuestionProgressStatus } from './types'

/* Cinza esmaecido das bordas e do fundo dos segmentos ainda não respondidos. */
export const CINZA_ESMAECIDO = corComOpacidade(tokens.colors.textTertiary, 0.15)

/* Acerto/erro usam degradês próprios, não os tokens success/danger. */
export const COLORS: Record<QuestionProgressStatus, string> = {
  correct: tokens.gradients.correct,
  incorrect: tokens.gradients.incorrect,
  // Mesmo realce azul de marca usado na Sidebar.
  current: tokens.gradients.blue,
  answered: tokens.colors.blue,
  pending: CINZA_ESMAECIDO,
}


/* Mais compacto que os 32px do Figma para não ocupar altura demais na prova. */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${CINZA_ESMAECIDO};
  border-radius: ${({ theme }) => theme.radius.md};
`

export const Title = styled.p`
  align-self: center;
  width: fit-content;

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
  text-align: center;
  white-space: nowrap;
`

/* Centralizado: esticado, cada segmento ficava enorme com poucas questões. */
export const Track = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`

export const SegmentColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`

export const Segment = styled.button<{ $color: string; $navigable: boolean; $pending: boolean }>`
  width: 40px;
  height: 8px;

  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ $color }) => $color};
  border: ${({ $pending }) => ($pending ? `1px solid ${CINZA_ESMAECIDO}` : 'none')};
  cursor: ${({ $navigable }) => ($navigable ? 'pointer' : 'default')};

  transition: transform ${({ theme }) => theme.transition.fast};

  &:hover:not(:disabled) {
    transform: ${({ $navigable }) => ($navigable ? 'scaleY(1.4)' : 'none')};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.purple};
    outline-offset: 2px;
  }
`

export const Number = styled.span<{ $current: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 24px;
  padding: 4px 8px;
  border-radius: ${({ $current, theme }) => ($current ? theme.radius.sm : theme.radius.md)};

  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme, $current }) => ($current ? theme.colors.white : theme.colors.textSecondary)};
  background: ${({ $current, theme }) => ($current ? COLORS.current : theme.colors.white)};
`

export const Legend = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`

export const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ $color }) => $color};
`
