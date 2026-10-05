import styled from 'styled-components'
// Gap igual ao padding do Card. Sempre 4 colunas em telas largas (auto-fill
// colocaria uma 5ª/6ª), colapsando para 2 e 1 em telas estreitas.
export const GradeDesempenho = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

/* No card, turma e disciplina são tags com ícone; o texto por extenso fica no modal. */
export const InfoSimulado = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`
