import styled, { type DefaultTheme } from 'styled-components'

export const GradeAutoAjuste = styled.div<{
  $larguraMinima: string
  $espaco?: keyof DefaultTheme['spacing']
}>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(${({ $larguraMinima }) => $larguraMinima}, 100%), 1fr));
  gap: ${({ theme, $espaco = 'md' }) => theme.spacing[$espaco]};
`

export const GradeDuasColunas = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`
