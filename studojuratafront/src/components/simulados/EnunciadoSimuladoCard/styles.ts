import styled from 'styled-components'
import { animacaoFlutuar } from '@/styles/animations'
import { theme as tokens } from '@/styles/theme'

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};

  background: ${tokens.gradients.frame};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.floating};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`

export const Mascote = styled.img`
  width: 136px;
  height: 136px;
  flex-shrink: 0;
  object-fit: contain;
  ${animacaoFlutuar}
`

export const Balao = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};

  background: ${({ theme }) => theme.colors.white};
  border-radius: 50px;
  box-shadow: ${({ theme }) => theme.shadow.floating};

  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);

    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-right: 14px solid ${({ theme }) => theme.colors.white};

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
      display: none;
    }
  }
`

export const Texto = styled.p`
  flex: 1;
  min-width: 0;

  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.blue};
  text-align: center;
  overflow-wrap: anywhere;
`

export const BotaoAudio = styled.button<{ $falando: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 48px;
  height: 48px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme, $falando }) => ($falando ? theme.colors.purple : theme.colors.blue)};
  color: ${({ theme }) => theme.colors.white};

  transition:
    transform ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.base};

  &:hover {
    transform: scale(1.06);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  svg {
    width: 22px;
    height: 22px;
  }
`
