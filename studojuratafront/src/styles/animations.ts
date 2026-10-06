import { css, keyframes } from 'styled-components'

export const flutuar = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`

export const animacaoFlutuar = css`
  animation: ${flutuar} 3.2s ease-in-out infinite;
`
