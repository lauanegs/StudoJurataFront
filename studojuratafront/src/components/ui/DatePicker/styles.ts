import { DateInput, TimePicker } from '@mantine/dates'
import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'

export const estilosCampo = (error?: string) => ({
  input: {
    height: '56px',
    minHeight: '56px',
    borderWidth: '2px',
    borderColor: error ? tokens.colors.error : tokens.colors.buttonPurple,
    boxShadow: tokens.shadow.base,
  },
})

export const CampoData = styled(DateInput)<{ $maxWidth?: string; $flex?: number }>`
  max-width: ${({ $maxWidth }) => $maxWidth ?? 'none'};
  flex: ${({ $flex }) => $flex ?? 'initial'};
  min-width: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: none;
  }
`

export const CampoHora = styled(TimePicker)`
  flex: 1;
  min-width: 128px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: none;
    min-width: 0;
  }
`

export const LinhaDataHora = styled.div<{ $maxWidth?: string }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  max-width: ${({ $maxWidth }) => $maxWidth ?? 'none'};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`

export const IconeClicavel = styled.span<{ $desabilitado?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: ${({ $desabilitado }) => ($desabilitado ? 'default' : 'pointer')};
`
