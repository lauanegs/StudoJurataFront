import styled from 'styled-components'

export const Container = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;

  width: 100%;
  max-height: 250px;
  padding: 32px;
  background-color: #8b5cf6;
  border-radius: 12px;
  overflow: hidden;

  @media (min-width: 768px) {
    flex-direction: row;
    padding: 40px 60px;
    gap: 40px;
  }
`

export const Mascote = styled.img`
  width: 140px;
  height: auto;
  object-fit: contain;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;

  @media (min-width: 768px) {
    text-align: left;
  }
`

export const Titulo = styled.h1`
  font-size: clamp(20px, 4vw, 40px);
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
`

export const Subtitulo = styled.p`
  font-size: clamp(14px, 2.5vw, 22px);
  font-weight: 500;
  color: #ffffff;
  opacity: 0.9;
`