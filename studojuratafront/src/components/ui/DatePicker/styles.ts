import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  height: 44px;

  padding: 0 12px;
  gap: 8px;

  background: white;
  border: 2px solid #c8a8ff;
  border-radius: 10px;
`

export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  color: #6b6b6b;
  cursor: pointer;
`

export const InputElement = styled.input`
  border: none;
  outline: none;

  width: 100%;

  font-size: 14px;
  color: #6b6b6b;

  background: transparent;

  &::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
  }
`