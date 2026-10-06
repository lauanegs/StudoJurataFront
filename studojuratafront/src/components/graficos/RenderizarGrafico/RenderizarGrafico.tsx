import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import type { ReactElement } from 'react'

import { mantineTheme } from '@/styles/mantineTheme'
import { theme as tokens } from '@/styles/theme'

import type { ImagemGrafico } from './types'

const LARGURA_PADRAO = 640
const TEMPO_LIMITE_MS = 4000

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
      ctx.fillStyle = tokens.colors.white
      ctx.fillRect(0, 0, largura, altura)
      ctx.drawImage(img, 0, 0, largura, altura)
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.92), largura, altura })
    }
    img.onerror = () => resolve(null)
    img.src = svgDataUrl
  })
}

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
  container.style.background = tokens.colors.white
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(<MantineProvider theme={mantineTheme}>{elemento}</MantineProvider>)

  const tempoLimite = new Promise<null>((resolve) => setTimeout(() => resolve(null), TEMPO_LIMITE_MS))

  const captura = (async () => {
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
