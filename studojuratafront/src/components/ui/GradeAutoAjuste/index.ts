import styled, { type DefaultTheme } from 'styled-components'

/**
 * Encaixa quantas colunas couberem com a largura mínima informada. O SimpleGrid
 * do Mantine usa número fixo de colunas por breakpoint, o que mudaria a
 * responsividade das telas que já usam auto-fit.
 */
export const GradeAutoAjuste = styled.div<{
  $larguraMinima: string
  $espaco?: keyof DefaultTheme['spacing']
}>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${({ $larguraMinima }) => $larguraMinima}, 1fr));
  gap: ${({ theme, $espaco = 'md' }) => theme.spacing[$espaco]};
`
