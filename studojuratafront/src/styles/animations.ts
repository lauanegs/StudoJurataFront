import { css, keyframes } from 'styled-components'

/**
 * Flutuação leve e contínua — usada em todo personagem/mascote ilustrado da
 * aplicação (banner, balão de enunciado, tela de resultado, skins da loja)
 * pra dar a sensação de que eles estão sempre "boiando", sem chamar atenção
 * demais nem interferir na leitura do conteúdo ao redor.
 */
export const flutuar = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`

/** Duração/timing padrão pra aplicar `flutuar` — mantém todo personagem no mesmo ritmo. */
export const animacaoFlutuar = css`
  animation: ${flutuar} 3.2s ease-in-out infinite;
`
