import { Group, Modal } from '@mantine/core'
import styled from 'styled-components'

export const Titulo = styled(Modal.Title)`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Rodape = styled(Group)`
  padding: ${({ theme }) => `0 var(--mantine-spacing-md) ${theme.spacing.xl}`};
`
