import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'
import type { QuestionProgressStatus } from './types'

export const CINZA_ESMAECIDO = corComOpacidade(tokens.colors.textTertiary, 0.15)

export const COLORS: Record<QuestionProgressStatus, string> = {
  correct: tokens.gradients.correct,
  incorrect: tokens.gradients.incorrect,
  current: tokens.gradients.blue,
  answered: tokens.colors.blue,
  pending: CINZA_ESMAECIDO,
}

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${CINZA_ESMAECIDO};
  border-radius: ${({ theme }) => theme.radius.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.xxs};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  }
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

export const Track = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-wrap: nowrap;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`

export const SegmentColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: 1 1 0;
    min-width: 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) and (max-height: 640px) {
    & > span {
      display: none;
    }
  }
`

export const Segment = styled.button<{ $color: string; $navigable: boolean; $pending: boolean }>`
  width: 40px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
  }

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
