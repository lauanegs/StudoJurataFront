import styled, { type DefaultTheme } from 'styled-components'

export const GradeAutoAjuste = styled.div<{
  $larguraMinima: string
  $espaco?: keyof DefaultTheme['spacing']
}>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${({ $larguraMinima }) => $larguraMinima}, 1fr));
  gap: ${({ theme, $espaco = 'md' }) => theme.spacing[$espaco]};
`
