import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;

  width: 100%;
  padding: 24px 32px;

  background-color: #ffffff;
  border-radius: 12px;
`

export const TabItem = styled.button<{ $active?: boolean }>`
  position: relative;

  border: none;
  background: transparent;

  padding: 12px 8px;

  font-size: 15px;
  font-weight: 500;

  color: ${({ $active }) => ($active ? '#374151' : '#6b7280')};

  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: #374151;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;

    width: ${({ $active }) => ($active ? '100%' : '0%')};
    height: 2px;

    background-color: #8b5cf6;
    border-radius: 2px;

    transition: width 0.25s ease-in-out;
  }
`