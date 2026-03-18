import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  width: 100%;
  padding: 16px 20px;

  background-color: #ffffff;
`

export const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;

  background-color: #8b5cf6;
  border-radius: 8px;

  color: #ffffff;
  font-size: 14px;
`

export const Title = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #7c3aed;
`

export const ContentWrapper = styled.div`
  position: relative;
  padding: 12px 20px 16px;
`

export const Content = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);

  width: 32px;
  height: 32px;

  border: none;
  border-radius: 50%;
  background-color: #8b5cf6;
  color: #fff;

  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);

  display: flex;
  align-items: center;
  justify-content: center;

  transition: 0.2s;

  &:hover {
    background-color: #7c3aed;
  }
`