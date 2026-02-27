import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`

export const THead = styled.thead`
  background-color: #f8fafc;
`

export const Th = styled.th`
  padding: 16px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  text-transform: capitalize;
`

export const Tr = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fcfcfd;
  }
`

export const Td = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #475569;
  vertical-align: middle;
`

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  font-size: 14px;
  color: #64748b;
`

export const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background-color: #e2e8f0;
  cursor: pointer;
  color: #475569;

  &:hover {
    background-color: #cbd5e1;
  }
`