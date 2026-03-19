import styled from 'styled-components'

export const Container = styled.header`
  width: 100%;
  min-height: 120px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 24px 32px;

  background: #ffffff;
  border-radius: 12px;
`

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 500;
  color: #6b6b6b;
`

export const Actions = styled.div`
  width: 100%;

  display: flex;
  justify-content: flex-start;
  flex-direction: row-reverse; 
  gap: 12px;

  margin-top: 16px;
`