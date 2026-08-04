import styled, { css } from 'styled-components'

export const Cabecalho = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;

  margin-bottom: ${({ theme }) => theme.spacing.md};
`

export const Identificacao = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const Numero = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

export const Acoes = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`

export const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

export const SeletorTipo = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xxs};
`

/** Confirmado no Figma ("Novo simulado"): opção inativa é branca com borda roxa fina. */
export const OpcaoTipo = styled.button<{ $ativa: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.buttonPurple};

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};

  color: ${({ theme, $ativa }) => ($ativa ? theme.colors.white : theme.colors.buttonPurple)};
  background: ${({ theme, $ativa }) => ($ativa ? theme.gradients.primary : theme.colors.white)};

  transition: background ${({ theme }) => theme.transition.base};

  &:disabled {
    opacity: 0.5;
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }
`

export const ListaAlternativas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const LinhaAlternativa = styled.div<{ $correta: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => theme.spacing.xxs};
  border-radius: ${({ theme }) => theme.radius.md};

  ${({ $correta, theme }) =>
    $correta &&
    css`
      background: ${theme.colors.successBackground};
    `}
`

export const BotaoCorreta = styled.button<{ $correta: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 40px;
  height: 40px;

  border-radius: ${({ theme }) => theme.radius.sm};
  border: 2px solid ${({ theme }) => theme.colors.buttonPurple};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};

  color: ${({ theme, $correta }) => ($correta ? theme.colors.white : theme.colors.buttonPurple)};
  background: ${({ theme, $correta }) => ($correta ? theme.gradients.primary : theme.colors.white)};

  transition: background ${({ theme }) => theme.transition.base};

  &:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`

export const CampoAlternativa = styled.div`
  flex: 1;
  min-width: 0;
`

export const MensagemErro = styled.p`
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.errorText};
`

export const Rodape = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;

  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export const Dica = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`
