import styled from 'styled-components'

export const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const Anel = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`

export const Svg = styled.svg`
  transform: rotate(-90deg);
`

export const Centro = styled.div<{ $cor: string; $size: number }>`
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  /* Proporção confirmada no Figma: anel de 175px ~ texto de 32px. */
  font-size: ${({ $size }) => Math.round($size * 0.183)}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ $cor }) => $cor};
  font-variant-numeric: tabular-nums;
`

export const Rotulo = styled.span`
  max-width: 110px;

  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  overflow-wrap: anywhere;
`
