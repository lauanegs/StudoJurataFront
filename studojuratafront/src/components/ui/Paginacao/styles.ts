import { Group } from '@mantine/core'
import styled from 'styled-components'

export const Navegacao = styled(Group)`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export const Rotulo = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`
