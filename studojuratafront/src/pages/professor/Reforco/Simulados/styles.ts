import styled from 'styled-components'

export const LinhaFiltrosFlutuante = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

export const CampoLargura = styled.div`
  width: 211px;
`

export const SemValor = styled.span`
  color: ${({ theme }) => theme.colors.textDisabled};
`
