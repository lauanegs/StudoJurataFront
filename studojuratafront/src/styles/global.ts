import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.typography.family};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.textStrong};
    background: ${({ theme }) => theme.colors.background};

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  button,
  input,
  textarea,
  select {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul,
  ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    display: block;
  }

  /* Acessibilidade: o anel de foco só aparece na navegação por teclado. */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.purple};
    outline-offset: 2px;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.purpleSoft};
    color: ${({ theme }) => theme.colors.purple};
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radius.pill};
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Usado pelo DataTable pra esconder colunas secundárias em telas pequenas
     e destacar cabeçalhos ordenáveis — mais simples que estilo por instância
     pra uma classe utilitária reaproveitada em toda tabela. */
  .oculta-tela-pequena {
    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      display: none;
    }
  }

  .coluna-ordenavel:hover {
    color: ${({ theme }) => theme.colors.purple};
  }

  /* Selo de ícone do cabeçalho do Card — o ícone (lucide) vem com 24px por
     padrão; sem isso ele estoura o círculo de 28px. */
  .icone-card svg {
    width: 16px;
    height: 16px;
  }

  /* O Edge (e o Chrome, quando o gerenciador de senha do sistema operacional
     está ativo) desenha o próprio olho de "mostrar senha" em cima do campo —
     duplicando o nosso. Como já temos o nosso, o nativo fica escondido. */
  input[type='password']::-ms-reveal,
  input[type='password']::-ms-clear {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`
