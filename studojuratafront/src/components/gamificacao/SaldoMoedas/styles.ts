import styled from 'styled-components'

export const Container = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.whiteVeil};
  border-radius: ${({ theme }) => theme.radius.pill};

  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`
