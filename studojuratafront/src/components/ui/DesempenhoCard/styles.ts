import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 24px;

  background: white;
  border-radius: 12px;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
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

export const Percent = styled.div<{ color: 'danger' | 'warning' | 'success' }>`
  width: 80px;
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 22px;
  font-weight: 700;

  color: white;
  border-radius: 10px;

  background: ${({ color }) => {
    if (color === 'danger') return '#d9535c'
    if (color === 'warning') return '#f4c20d'
    return '#1db954'
  }};
`