import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: flex-start; 
  gap: 16px;

  width: 100%;
  padding: 16px 20px;

  background: #f5f5f5;
  border: 2px solid #f2b705;
  border-radius: 12px;
`

export const Icon = styled.img`
  width: 96px;
  height: 96px;
  object-fit: contain;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  /* Garante que os textos comecem sempre da esquerda */
  align-items: flex-start; 
  text-align: left;
`

export const Title = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #6b6b6b;
`

export const Description = styled.span`
  font-size: 14px;
  color: #6b6b6b;
`

export const Media = styled.span`
  font-size: 14px;
  color: #6b6b6b;
`