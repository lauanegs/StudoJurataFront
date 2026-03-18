import styled from 'styled-components'

export const Container = styled.button<{ selecionado?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;

  padding: 0;
  cursor: pointer;

  background: #ffffff;
  border-radius: 8px;

  border: 2px solid
    ${({ selecionado }) => (selecionado ? '#1C8BA5' : '#E5E5E5')};

  transition: all 0.2s ease;

  &:hover {
    border-color: #1C8BA5;
  }
`

export const LetraBox = styled.div<{ selecionado?: boolean }>`
  min-width: 64px;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: ${({ selecionado }) =>
    selecionado ? '#0E7490' : '#1C8BA5'};
  color: white;
  font-weight: 600;
  font-size: 18px;

  border-radius: 6px 0 0 6px;
`

export const TextoBox = styled.div`
  flex: 1;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #ffffff;
  color: #1C8BA5;
  font-weight: 500;
  font-size: 16px;

  border-radius: 0 6px 6px 0;
`

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
`