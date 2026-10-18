import { Tabs } from '@mantine/core'
import styled from 'styled-components'

export const Envelope = styled.div`
  width: 100%;
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

export const Lista = styled(Tabs.List)`
  flex-wrap: nowrap;
  overflow-x: auto;
  border: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  button[role='tab'] {
    flex: 0 0 auto;
    height: 52px;
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => `${theme.radius.md} ${theme.radius.md} 0 0`};
    background: transparent;
    font-size: ${({ theme }) => theme.typography.sizes.md};
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
    letter-spacing: -0.8px;
    color: ${({ theme }) => theme.colors.textSecondary};
    white-space: nowrap;
  }

  button[role='tab'][data-active] {
    border-bottom-color: ${({ theme }) => theme.colors.buttonPurple};
    background: ${({ theme }) => theme.colors.neutralTintSoft};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.sm} 0;
    overflow-x: visible;

    &::before {
      display: none;
    }

    button[role='tab'] {
      flex: 1 1 calc(50% - ${({ theme }) => theme.spacing.xs});
      justify-content: center;
      min-width: 0;
      height: auto;
      min-height: 48px;
      padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
      border: 2px solid ${({ theme }) => theme.colors.borderStrong};
      border-radius: ${({ theme }) => theme.radius.md};
      background: ${({ theme }) => theme.colors.white};
      font-size: ${({ theme }) => theme.typography.sizes.sm};
      letter-spacing: -0.4px;
      line-height: ${({ theme }) => theme.typography.lineHeight.tight};
      white-space: normal;
      text-align: center;
    }

    button[role='tab'][data-active] {
      border-color: ${({ theme }) => theme.colors.buttonPurple};
      background: ${({ theme }) => theme.colors.neutralTintSoft};
      color: ${({ theme }) => theme.colors.purple};
    }
  }
`

export const Contador = styled.span<{ $ativa: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ $ativa, theme }) => ($ativa ? theme.colors.purple : theme.colors.background)};
  color: ${({ $ativa, theme }) => ($ativa ? theme.colors.white : theme.colors.textSecondary)};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`
