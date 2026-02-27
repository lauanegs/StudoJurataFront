import styled from 'styled-components'

export const Container = styled.button<{ selecionado?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;

  border: none;
  padding: 0;
  cursor: pointer;

  background: transparent;
`

export const LetraBox = styled.div<{ selecionado?: boolean }>`
  min-width: 64px;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: ${({ selecionado }) => (selecionado ? '#0E7490' : '#1C8BA5')};
  color: white;
  font-weight: 600;
  font-size: 18px;

  border-radius: 8px 0 0 8px;
`

export const TextoBox = styled.div<{ selecionado?: boolean }>`
  flex: 1;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: ${({ selecionado }) => (selecionado ? '#E6F4F7' : '#EDEDED')};
  color: #1C8BA5;
  font-weight: 500;
  font-size: 16px;

  border-radius: 0 8px 8px 0;

  transition: 0.2s;
`

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
`