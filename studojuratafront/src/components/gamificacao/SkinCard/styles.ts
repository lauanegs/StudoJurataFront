import styled from 'styled-components'

export const Container = styled.article<{ $ativa: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 2px solid
    ${({ theme, $ativa }) => ($ativa ? theme.colors.success : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md};

  transition: border-color ${({ theme }) => theme.transition.base};
`

export const Moldura = styled.div<{ $bloqueada: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 120px;
  height: 120px;

  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;

    ${({ $bloqueada }) =>
      $bloqueada &&
      'filter: grayscale(1) brightness(0.9); opacity: 0.65;'}
  }
`

export const Nome = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
  text-align: center;
`

export const Preco = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.warningText};
`
