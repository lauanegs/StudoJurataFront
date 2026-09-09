import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import type { ReactElement } from 'react'

import { mantineTheme } from '../styles/mantineTheme'
import { theme as tokens } from '../styles/theme'

export interface ImagemGrafico {
  dataUrl: string
  largura: number
  altura: number
}

const LARGURA_PADRAO = 640
/** Tempo máximo esperando o gráfico desenhar antes de desistir — não pode travar a exportação inteira por causa de UM gráfico. */
const TEMPO_LIMITE_MS = 4000

/**
 * Serializa o próprio SVG do gráfico (não uma captura de tela da página
 * inteira) pra um JPEG — leve e rápido, sem depender de bibliotecas de
 * captura de DOM. Recharts desenha cor/traço como atributo direto no SVG
 * (não depende de classe CSS externa), então a aparência sai fiel; só a
 * fonte do texto dos eixos precisa de uma regra explícita porque a
 * serialização não carrega o CSS global da página.
 */
function svgParaImagem(svg: SVGSVGElement): Promise<ImagemGrafico | null> {
  return new Promise((resolve) => {
    const bbox = svg.getBoundingClientRect()
    const largura = Math.round(bbox.width) || LARGURA_PADRAO
    const altura = Math.round(bbox.height) || 300

    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('width', String(largura))
    clone.setAttribute('height', String(altura))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    const estilo = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    estilo.textContent = `text { font-family: ${tokens.typography.family}; }`
    clone.insertBefore(estilo, clone.firstChild)

    const serializado = new XMLSerializer().serializeToString(clone)
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializado)}`

    const img = new Image()
    img.onload = () => {
      const escala = 2
      const canvas = document.createElement('canvas')
      canvas.width = largura * escala
      canvas.height = altura * escala
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }
      ctx.scale(escala, escala)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, largura, altura)
      ctx.drawImage(img, 0, 0, largura, altura)
      // JPEG, não PNG: o fundo já é opaco (sem precisar de canal alfa) e o
      // jsPDF embute PNG capturado de canvas praticamente sem compressão,
      // inflando um gráfico simples pra alguns MB — JPEG em qualidade alta
      // fica visualmente idêntico pra esse tipo de imagem (poucas cores
      // sólidas) e um por cento do tamanho.
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.92), largura, altura })
    }
    img.onerror = () => resolve(null)
    img.src = svgDataUrl
  })
}

/**
 * Renderiza um gráfico (Histograma/GraficoBarras/GraficoLinha — os MESMOS
 * componentes da tela, não uma reimplementação) fora da tela e captura o
 * desenho como JPEG, pra entrar nos relatórios exportados (PDF/Excel) além
 * da tabela de valores exatos que já ia. Envolve em MantineProvider próprio
 * porque o container fica fora da árvore React da aplicação
 * (BarChart/LineChart usam hooks do Mantine que exigem o provider por
 * perto).
 */
export async function renderizarGraficoComoImagem(
  elemento: ReactElement,
  largura = LARGURA_PADRAO,
  altura = 300,
): Promise<ImagemGrafico | null> {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '-10000px'
  container.style.width = `${largura}px`
  container.style.height = `${altura}px`
  container.style.background = '#ffffff'
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(<MantineProvider theme={mantineTheme}>{elemento}</MantineProvider>)

  const tempoLimite = new Promise<null>((resolve) => setTimeout(() => resolve(null), TEMPO_LIMITE_MS))

  const captura = (async () => {
    // Espera o SVG aparecer no container (React commitar + o
    // ResizeObserver do Recharts medir e desenhar) via polling com
    // setTimeout — de propósito, não requestAnimationFrame: o navegador
    // pausa rAF quando a aba/pane fica em segundo plano, o que travaria a
    // exportação indefinidamente numa sessão sem foco.
    let svg: SVGSVGElement | null = null
    const inicio = Date.now()
    while (!svg && Date.now() - inicio < TEMPO_LIMITE_MS - 200) {
      svg = container.querySelector('svg')
      if (!svg) await new Promise((resolve) => setTimeout(resolve, 60))
    }
    if (!svg) return null

    return svgParaImagem(svg)
  })().catch(() => null)

  try {
    return await Promise.race([captura, tempoLimite])
  } finally {
    root.unmount()
    container.remove()
  }
}
