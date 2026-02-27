import styled from 'styled-components'

export const Container = styled.div`
  position: relative;
  width: 100%;
  font-family: sans-serif;
`

export const SelectTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  width: 100%;
  padding: 12px 16px;
  background: #ffffff;
  border: 2px solid #c4b5fd;
  border-radius: 12px;
  cursor: pointer;
  
  font-size: 16px;
  color: #4b5563;

  &:hover {
    border-color: #8b5cf6;
  }
`

export const OptionsList = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: #ffffff;
  border: 2px solid #c4b5fd;
  border-radius: 12px;
  overflow: hidden;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`

export const OptionItem = styled.div<{ isSelected: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.isSelected ? '#ffffff' : '#4b5563'};
  background-color: ${props => props.isSelected ? '#8b5cf6' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.isSelected ? '#7c3aed' : '#f3f4f6'};
  }
`