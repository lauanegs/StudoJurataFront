import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

export const RingWrapper = styled.div<{ $porcentagem: number; $cor: string }>`
  position: relative;

  width: 88px;
  height: 88px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: conic-gradient(
    ${({ $cor }) => $cor} ${({ $porcentagem }) => $porcentagem * 3.6}deg,
    #f1f5f9 0deg
  );
`

export const RingInner = styled.div<{ $cor: string }>`
  width: 68px;
  height: 68px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #ffffff;

  font-size: 16px;
  font-weight: 700;
  color: ${({ $cor }) => $cor};
`

export const Titulo = styled.span`
  font-size: 13px;
  color: #6b7280;
  text-align: center;
`
