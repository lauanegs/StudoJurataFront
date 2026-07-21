import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  min-width: 220px;
  padding: 16px;

  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
`

export const Titulo = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #374151;
`

export const Data = styled.span`
  align-self: flex-start;

  font-size: 12px;
  color: #6b7280;

  padding: 2px 10px;
  background: #f1f5f9;
  border-radius: 999px;
`

export const Descricao = styled.p`
  font-size: 13px;
  color: #6b7280;
`

export const Acoes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  cursor: pointer;
  color: #64748b;
`
