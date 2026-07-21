import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  padding: 20px 24px;

  background: #ffffff;
  border-radius: 12px;
`

export const Titulo = styled.p`
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`

export const Trilha = styled.div`
  display: flex;
  gap: 8px;
`

export const Bolinha = styled.div<{ $cor: string }>`
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: ${({ $cor }) => $cor};
`

export const Legenda = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  flex-wrap: wrap;
`

export const LegendaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  font-size: 12px;
  color: #6b7280;
`

export const LegendaBolinha = styled.span<{ $cor: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $cor }) => $cor};
`
