import styled, { css } from 'styled-components'

const sizes = {
  small: '32px',
  medium: '44px',
  large: '72px',
  extraLarge: '120px',
}

export const Container = styled.div<{
  $size: keyof typeof sizes
  $destaque?: boolean
}>`
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: ${({ $size }) => sizes[$size]};
  height: ${({ $size }) => sizes[$size]};

  border-radius: ${({ theme }) => theme.radius.circle};
  overflow: hidden;

  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.white};

  font-size: ${({ $size }) =>
    ({ small: '12px', medium: '14px', large: '22px', extraLarge: '36px' })[$size]};
  font-weight: 600;
  letter-spacing: 0.5px;

  ${({ $destaque, theme }) =>
    $destaque &&
    css`
      box-shadow: 0 0 0 3px ${theme.colors.white}, 0 0 0 6px ${theme.colors.warning};
    `}
`

export const Imagem = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`
