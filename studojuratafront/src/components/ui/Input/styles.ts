import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  width: 100%;
  max-width: 400px; /* Ou a largura que preferir */
  padding: 12px 16px;
  
  background: #ffffff;
  border: 2px solid #d1d5db; /* Cor padrão da borda */
  border-radius: 12px;
  transition: border-color 0.2s ease-in-out;

  &:focus-within {
    border-color: #8b5cf6; /* Roxo ao focar */
  }
`

export const InputElement = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  
  font-size: 16px;
  color: #4b5563;
  
  &::placeholder {
    color: #9ca3af;
  }
`

export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
`