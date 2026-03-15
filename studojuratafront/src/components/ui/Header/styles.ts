import styled from 'styled-components'

export const Container = styled.header`
  width: 100%;
  height: 120px;

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

  text-align: left;
`

export const InputRow = styled.div`
  display: flex;
  justify-content: flex-end;

  width: 100%;

  max-width: 300px;
  align-self: flex-end;
`