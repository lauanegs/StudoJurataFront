import styled from 'styled-components'

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
