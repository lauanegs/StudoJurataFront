import styled from 'styled-components'

/* Campos num modal: cinco numa linha do Header ficavam apertados. Só filtra ao clicar "Buscar". */
export const GradePeriodo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`
