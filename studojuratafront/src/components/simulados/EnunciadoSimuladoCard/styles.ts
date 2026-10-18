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
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  }
`

export const Mascote = styled.img`
  width: 136px;
  height: 136px;
  flex-shrink: 0;
  object-fit: contain;
  ${animacaoFlutuar}

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 56px;
    height: 56px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) and (max-height: 640px) {
    width: 40px;
    height: 40px;
  }
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

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
    border-radius: 24px;
    max-height: 30vh;
    overflow-y: auto;
  }

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

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.typography.sizes.md};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) and (max-height: 640px) {
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    line-height: 1.25;
  }

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

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 36px;
    height: 36px;
  }

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
