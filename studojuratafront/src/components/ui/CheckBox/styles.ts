import styled from 'styled-components'

export const Container = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};

  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  user-select: none;
`

export const Input = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

export const Marker = styled.span<{ $checked: boolean; $error?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 24px;
  height: 24px;
  margin-top: 1px;

  border: 2px solid
    ${({ theme, $checked, $error }) =>
      $error ? theme.colors.error : $checked ? theme.colors.purple : 'rgba(115, 115, 115, 0.2)'};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.purple : theme.colors.white)};
  color: ${({ theme }) => theme.colors.white};

  transition:
    background ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast};

  ${Input}:focus-visible + & {
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  ${Container}:hover & {
    border-color: ${({ theme, $checked }) => ($checked ? theme.colors.purple : theme.colors.purpleLight)};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

export const Content = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textStrong};
`

export const Description = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`

export const Error = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.errorText};
`

export const Wrapper = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`
