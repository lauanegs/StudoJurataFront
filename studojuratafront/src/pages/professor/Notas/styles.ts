import styled from 'styled-components'
/* 32px de padding (o padrão do Card é 24px, por isso semPadding) e 16px de gap. */
export const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`
