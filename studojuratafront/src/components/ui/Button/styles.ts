import styled from 'styled-components'

export const Container = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 100%;
  padding: 16px 32px;
  background-color: #8b5cf6;
  border: none;
  border-radius: 12px;
  
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    width: fit-content;
  }

  &:hover {
    background-color: #7c3aed;
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    filter: brightness(0.9);
  }

  &:disabled {
    background-color: #c4b5fd;
    cursor: not-allowed;
    opacity: 0.7;
  }
`

export const Label = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
`