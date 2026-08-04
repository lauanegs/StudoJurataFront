import styled, { css } from 'styled-components'

export const Container = styled.div<{ $maxWidth?: string }>`
  position: relative;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth ?? 'none'};
  min-width: 0;
`

export const Gatilho = styled.button<{ $erro?: boolean; $aberto?: boolean; $vazio?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs};

  width: 100%;
  min-height: 56px;
  padding: 0 ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  /* Confirmado no Figma: borda roxa mesmo fechado, não só quando aberto/focado. */
  border: 2px solid
    ${({ theme, $erro }) => ($erro ? theme.colors.error : theme.colors.buttonPurple)};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.base};

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  text-align: left;
  color: ${({ theme, $vazio }) => ($vazio ? theme.colors.textDisabled : theme.colors.textStrong)};

  transition:
    border-color ${({ theme }) => theme.transition.base},
    box-shadow ${({ theme }) => theme.transition.base};

  &:hover:not(:disabled) {
    border-color: ${({ theme, $erro }) => ($erro ? theme.colors.error : theme.colors.purpleLight)};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme, $erro }) => ($erro ? theme.shadow.focusError : theme.shadow.focus)};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.background};
    box-shadow: none;
    opacity: 0.75;
  }
`

export const Rotulo = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Adornos = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  color: ${({ theme }) => theme.colors.textTertiary};
`

export const Chevron = styled.span<{ $aberto: boolean }>`
  display: inline-flex;
  transition: transform ${({ theme }) => theme.transition.base};
  transform: rotate(${({ $aberto }) => ($aberto ? '180deg' : '0deg')});

  svg {
    width: 18px;
    height: 18px;
  }
`

export const Limpar = styled.span`
  display: inline-flex;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radius.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

export const Lista = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};

  width: 100%;
  max-height: 280px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xxs};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.card};
`

export const CaixaBusca = styled.div`
  padding: ${({ theme }) => theme.spacing.xxs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.xxs};

  input {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.xs};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.sm};
    outline: none;
    font-size: ${({ theme }) => theme.typography.sizes.sm};

    &:focus {
      border-color: ${({ theme }) => theme.colors.purple};
    }
  }
`

export const Item = styled.li<{ $selecionada: boolean; $ativa: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radius.sm};

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;

  color: ${({ theme, $selecionada }) =>
    $selecionada ? theme.colors.purple : theme.colors.textStrong};
  font-weight: ${({ theme, $selecionada }) =>
    $selecionada ? theme.typography.weights.semiBold : theme.typography.weights.regular};
  background: ${({ theme, $ativa, $selecionada }) =>
    $ativa ? theme.colors.purpleSoft : $selecionada ? theme.colors.purpleSoft : 'transparent'};

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.45;
      cursor: not-allowed;
    `}
`

export const Descricao = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  color: ${({ theme }) => theme.colors.textTertiary};
`

export const Vazio = styled.li`
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textTertiary};
  text-align: center;
`
