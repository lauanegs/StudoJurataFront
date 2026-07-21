import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding: 16px 20px;

  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export const Titulo = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
`

export const Descricao = styled.span`
  font-size: 13px;
  color: #9ca3af;
`
