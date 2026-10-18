import { TimePicker } from '@mantine/dates'
import styled from 'styled-components'

export const CampoHorario = styled(TimePicker)<{ $maxWidth?: string }>`
  max-width: ${({ $maxWidth }) => $maxWidth ?? 'none'};
`

export const BotaoRelogio = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  background: none;
  border: none;
  color: inherit;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
`
