/**
 * Degradê de marca azul-sobre-roxo — a Sidebar e o realce do segmento "questão
 * atual" da navegação de questões usam o mesmo valor, então ele fica numa
 * constante só (o `gradients` guarda uma chave por finalidade).
 */
const gradienteAzulMarca = 'linear-gradient(180deg, #049DBF 0%, rgba(4, 157, 191, 0.8) 100%), #662E9B'

/**
 * Tons dos degradês de perigo e sucesso, que existem em dois formatos: a string
 * CSS de `gradients` (styled-components) e o par from/to exigido pelos botões da
 * Mantine (`gradientPairs`). O valor de cada tom fica aqui, uma única vez.
 */
const tonsDePerigo = { from: '#DB5461', to: '#CF505C' }
const tonsDeSucesso = { from: '#3DCB63', to: '#34C759' }

/** Cinza-azulado neutro da página — é também a cor das bordas suaves. */
const fundoNeutro = '#E6EAF2'

export const theme = {
  colors: {
    purple: '#662E9B',
    purpleDark: '#4E2277',
    purpleLight: '#8B5CF6',
    purpleSoft: '#F1EAFA',

    buttonPurple: '#8148B7',
    buttonPurpleLight: '#9256CC',
    buttonPurpleDark: '#6E3B9E',

    blue: '#049DBF',
    blueDark: '#037E99',
    blueLight: '#43BCCD',
    blueAccent: '#1E87F0',

    white: '#FFFFFF',
    background: fundoNeutro,
    // Véu escuro por cima da tela quando o menu abre no celular (mesmo tom
    // escuro de shadow.card, com opacidade maior).
    scrim: '#18274B',
    border: fundoNeutro,
    borderStrong: '#D5DCE8',
    textStrong: '#202020',
    textSecondary: '#656565',
    textTertiary: '#737373',
    textDisabled: '#A3A3A3',

    success: '#34C759',
    successBackground: '#E7F9ED',
    successText: '#1B7F3B',

    error: '#FF383C',
    errorBackground: '#FFECEC',
    errorText: '#B3232B',

    warning: '#FFCC00',
    warningBackground: '#FFF8E1',
    warningText: '#8A6100',

    info: '#049DBF',
    infoBackground: '#E4F6FA',
    infoText: '#04687F',

    orange: '#FF8D28',
  },

  gradients: {
    primary: 'linear-gradient(180deg, #8148B7 0%, #9256CC 100%)',
    primaryHover: 'linear-gradient(180deg, #6E3B9E 0%, #8148B7 100%)',
    sidebar: gradienteAzulMarca,
    // Mesmo degradê do `sidebar` — realce azul de marca, usado fora do menu.
    blue: gradienteAzulMarca,
    banner: 'linear-gradient(180deg, #8148B7 0%, #9256CC 100%)',
    danger: `linear-gradient(180deg, ${tonsDePerigo.from} 0%, ${tonsDePerigo.to} 100%)`,
    // Mesmo verde de colors.success, para não haver dois verdes na UI.
    success: `linear-gradient(180deg, ${tonsDeSucesso.from} 0%, ${tonsDeSucesso.to} 100%)`,
    // Moldura azul das telas do aluno (enunciado da questão e card de
    // resultado): azul sobre o fundo neutro da página.
    frame: `linear-gradient(90deg, #049DBF 0%, rgba(4, 157, 191, 0.5) 100%), ${fundoNeutro}`,
    // Acerto/erro da navegação de questões: verde e laranja próprios, mais
    // vivos que colors.success/colors.error de propósito.
    correct: 'linear-gradient(90deg, #0CCA4A 0%, #46A665 100%)',
    incorrect: 'linear-gradient(90deg, #F95738 0%, #F86624 100%)',
    border: 'linear-gradient(135deg, #662E9B 0%, #049DBF 100%)',
  },

  /**
   * Pares from/to dos mesmos degradês de perigo e sucesso — a Mantine recebe o
   * degradê de um botão em duas cores, não em uma string CSS.
   */
  gradientPairs: {
    danger: tonsDePerigo,
    success: tonsDeSucesso,
  },

  typography: {
    family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    sizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      title: '32px',
    },
    weights: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1,
      normal: 1.4,
      loose: 1.6,
    },
  },

  spacing: {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '40px',
    xxxl: '48px',
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    pill: '999px',
    circle: '50%',
  },

  shadow: {
    // Suave de propósito: telas com muitos cards cansavam a vista com sombra mais forte.
    base: '0 2px 10px rgba(0, 0, 0, 0.05)',
    light: '0 2px 4px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.08)',
    card: '0 8px 18px rgba(24, 39, 75, 0.12)',
    floating: '0 4px 7.5px rgba(0, 0, 0, 0.08)',
    modal: '0 8px 50px rgba(0, 0, 0, 0.18)',
    focus: '0 0 0 3px rgba(102, 46, 155, 0.22)',
    focusError: '0 0 0 3px rgba(255, 56, 60, 0.20)',
  },

  zIndex: {
    base: 1,
    dropdown: 100,
    sidebar: 200,
    overlay: 900,
    modal: 1000,
    toast: 1100,
  },

  breakpoints: {
    mobile: '640px',
    tablet: '1024px',
    desktop: '1280px',
  },

  layout: {
    sidebarWidth: '260px',
    sidebarWidthCollapsed: '76px',
    contentWidth: '1280px',
  },

  transition: {
    fast: '120ms ease',
    base: '200ms ease',
    slow: '320ms ease',
  },
} as const

export type Theme = typeof theme
