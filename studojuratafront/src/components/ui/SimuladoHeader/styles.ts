import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding: 16px 24px;

  background: #ffffff;
  border-radius: 12px;
`

export const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const Logo = styled.img`
  width: 36px;
  height: 36px;
`

export const Titulo = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
`

export const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const Tempo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;

  font-size: 14px;
  color: #374151;
`

export const SairButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 8px 16px;
  border: none;
  border-radius: 999px;

  background: #049DBF;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;

  cursor: pointer;

  &:hover {
    background: #037e99;
  }
`
