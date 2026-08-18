import type { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled.article`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

const Icon = styled.span<{ $color: string; $background: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 48px;
  height: 48px;

  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $background }) => $background};
  color: ${({ $color }) => $color};

  svg {
    width: 22px;
    height: 22px;
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Value = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.textStrong};
  font-variant-numeric: tabular-nums;
`

const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export type InfoCardTone = 'purple' | 'blue' | 'success' | 'warning' | 'error'

interface InfoCardProps {
  value: ReactNode
  label: string
  icon: ReactNode
  tone?: InfoCardTone
}

export function InfoCard({ value, label, icon, tone = 'purple' }: InfoCardProps) {
  const palette: Record<InfoCardTone, { color: string; background: string }> = {
    purple: { color: '#662E9B', background: '#F1EAFA' },
    blue: { color: '#049DBF', background: '#E4F6FA' },
    success: { color: '#1B7F3B', background: '#E7F9ED' },
    warning: { color: '#8A6100', background: '#FFF8E1' },
    error: { color: '#B3232B', background: '#FFECEC' },
  }

  return (
    <Container>
      <Icon $color={palette[tone].color} $background={palette[tone].background} aria-hidden="true">
        {icon}
      </Icon>

      <Content>
        <Value>{value}</Value>
        <Label>{label}</Label>
      </Content>
    </Container>
  )
}
