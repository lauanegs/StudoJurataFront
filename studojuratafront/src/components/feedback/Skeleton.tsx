import styled, { keyframes } from 'styled-components'

const brilhar = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

export const Skeleton = styled.div<{ $largura?: string; $altura?: string; $raio?: string }>`
  width: ${({ $largura }) => $largura ?? '100%'};
  height: ${({ $altura }) => $altura ?? '16px'};
  border-radius: ${({ theme, $raio }) => $raio ?? theme.radius.sm};

  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.background} 25%,
    #eef1f7 37%,
    ${({ theme }) => theme.colors.background} 63%
  );
  background-size: 200% 100%;
  animation: ${brilhar} 1.4s ease infinite;
`

export const SkeletonTexto = styled(Skeleton)`
  height: 12px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
    width: 60%;
  }
`

export const SkeletonCartao = styled(Skeleton)`
  height: 120px;
  border-radius: ${({ theme }) => theme.radius.lg};
`
