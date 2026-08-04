import styled from 'styled-components'

export const Lista = styled.div<{ $direction: 'horizontal' | 'vertical' }>`
  display: flex;
  flex-direction: ${({ $direction }) => ($direction === 'horizontal' ? 'row' : 'column')};
  flex-wrap: wrap;
  gap: ${({ theme, $direction }) => ($direction === 'horizontal' ? theme.spacing.lg : theme.spacing.xs)};
`

export const Opcao = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};

  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`

export const Entrada = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

export const Marcador = styled.span<{ $marked: boolean; $error?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 20px;
  height: 20px;
  margin-top: 1px;

  border: 2px solid
    ${({ theme, $marked, $error }) =>
      $error ? theme.colors.error : $marked ? theme.colors.purple : 'rgba(115, 115, 115, 0.2)'};
  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme }) => theme.colors.white};

  transition: border-color ${({ theme }) => theme.transition.fast};

  ${Entrada}:focus-visible + & {
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  &::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: ${({ theme }) => theme.radius.circle};
    background: ${({ theme }) => theme.colors.purple};
    transform: scale(${({ $marked }) => ($marked ? 1 : 0)});
    transition: transform ${({ theme }) => theme.transition.fast};
  }
`

export const Conteudo = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const Texto = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textStrong};
`

export const Descricao = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`
