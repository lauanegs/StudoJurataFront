import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  background-color: #ffffff;
  border: 2px solid rgba(115, 115, 115, 0.15);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px;
  cursor: pointer;

  &:hover {
    background-color: #f9f9f9;
  }
`

export const Title = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #3f3f3f;
`

export const RightContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const Grade = styled.span`
  font-size: 14px;
  color: #6b7280;
`

export const Icon = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  transition: transform 0.25s ease;

  transform: rotate(${props => (props.isOpen ? '180deg' : '0deg')});
`

export const Content = styled.div`
  border-top: 1px solid #e5e5e5;
  padding: 8px 16px 12px;

  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 6px 0;
`

export const ItemLabel = styled.span`
  font-size: 14px;
  color: #525252;
`

export const ItemValue = styled.span`
  font-size: 14px;
  color: #525252;
`