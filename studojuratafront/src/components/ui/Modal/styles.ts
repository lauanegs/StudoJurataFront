import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(15, 23, 42, 0.45);
  padding: 24px;
`

export const Container = styled.div<{ $width?: string }>`
  width: 100%;
  max-width: ${({ $width }) => $width ?? '440px'};
  max-height: 90vh;
  overflow-y: auto;

  background: #ffffff;
  border-radius: 16px;
  padding: 32px;

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 24px;
`

export const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #374151;
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;

  &:hover {
    color: #374151;
  }
`

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`
