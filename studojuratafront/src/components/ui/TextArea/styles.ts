import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  
  background: #ffffff;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  transition: border-color 0.2s ease-in-out;

  &:focus-within {
    border-color: #8b5cf6;
  }
`

export const TextAreaElement = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;

  font-size: 16px;
  color: #4b5563;

  resize: none; /* opcional: remove resize manual */
  min-height: 100px;

  &::placeholder {
    color: #9ca3af;
  }
`