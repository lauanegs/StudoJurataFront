import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import { theme as tokens } from '../styles/theme'
import type { ImagemGrafico } from './renderizarGrafico'

export interface LinhaPdf {
  rotulo: string
  valor: string | number
}

export interface SecaoPdf {
  titulo: string
  colunaRotulo: string
  colunaValor: string
  linhas: LinhaPdf[]
  /** Desenho do gráfico (Histograma/GraficoBarras/GraficoLinha, capturado via renderizarGraficoComoImagem) — opcional, some acima da tabela de valores exatos. */
  imagem?: ImagemGrafico | null
}

/** Altura máxima reservada pro desenho do gráfico numa seção, em mm — imagens muito altas (gráfico bem estreito e alto) ficam limitadas por isso, não pela largura. */
const ALTURA_MAXIMA_IMAGEM_MM = 90

const MARGEM = 14

/** #662E9B (roxo da marca) em RGB — jsPDF-autotable pede a cor assim, não em hex. */
const ROXO_MARCA: [number, number, number] = [102, 46, 155]

function hexParaRgb(hex: string): [number, number, number] {
  const numero = parseInt(hex.replace('#', ''), 16)
  return [(numero >> 16) & 255, (numero >> 8) & 255, numero & 255]
}

/**
 * Gera um PDF de verdade (jsPDF + autoTable) a partir dos dados — não é
 * mais uma captura da tela impressa: sem depender do navegador paginar um
 * gráfico SVG corretamente, então nunca corta ou distorce. Cada seção vira
 * uma tabela, com título, contexto (filtros aplicados) e data de geração no
 * topo, numeração de página no rodapé.
 */
export function exportarPdf(nomeArquivo: string, titulo: string, contexto: string[], secoes: SecaoPdf[]) {
  const doc = new jsPDF()
  const larguraPagina = doc.internal.pageSize.getWidth()
  const alturaPagina = doc.internal.pageSize.getHeight()

  let cursorY = 18

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...hexParaRgb(tokens.colors.textStrong))
  doc.text(titulo, MARGEM, cursorY)
  cursorY += 7

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(130)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, MARGEM, cursorY)
  cursorY += 5

  contexto.forEach((linha) => {
    doc.text(linha, MARGEM, cursorY)
    cursorY += 5
  })

  cursorY += 4

  secoes.forEach((secao) => {
    // Seção nova sem espaço na página atual: pula pra próxima em vez de
    // começar o título colado no rodapé.
    if (cursorY > alturaPagina - 40) {
      doc.addPage()
      cursorY = 18
    }

    // Relatório de seção única cujo título já é o próprio título do PDF —
    // não repete o mesmo texto duas vezes.
    if (secoes.length > 1 || secao.titulo !== titulo) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...hexParaRgb(tokens.colors.textStrong))
      doc.text(secao.titulo, MARGEM, cursorY)
      cursorY += 3
    }

    if (secao.imagem) {
      const larguraDisponivel = larguraPagina - MARGEM * 2
      const proporcao = secao.imagem.largura / secao.imagem.altura
      let larguraImagem = larguraDisponivel
      let alturaImagem = larguraImagem / proporcao

      if (alturaImagem > ALTURA_MAXIMA_IMAGEM_MM) {
        alturaImagem = ALTURA_MAXIMA_IMAGEM_MM
        larguraImagem = alturaImagem * proporcao
      }

      // Imagem nova sem espaço na página atual: pula pra próxima em vez de cortar.
      if (cursorY + alturaImagem > alturaPagina - 20) {
        doc.addPage()
        cursorY = 18
      }

      doc.addImage(secao.imagem.dataUrl, 'JPEG', MARGEM, cursorY, larguraImagem, alturaImagem)
      cursorY += alturaImagem + 6
    }

    autoTable(doc, {
      startY: cursorY,
      head: [[secao.colunaRotulo, secao.colunaValor]],
      body: secao.linhas.length > 0 ? secao.linhas.map((linha) => [linha.rotulo, String(linha.valor)]) : [['—', '—']],
      margin: { left: MARGEM, right: MARGEM },
      styles: { fontSize: 9, textColor: hexParaRgb(tokens.colors.textSecondary) },
      headStyles: { fillColor: ROXO_MARCA, textColor: 255 },
      alternateRowStyles: { fillColor: hexParaRgb(tokens.colors.background) },
    })

    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  })

  const totalPaginas = doc.getNumberOfPages()
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Página ${pagina} de ${totalPaginas}`, larguraPagina - MARGEM, alturaPagina - 8, { align: 'right' })
  }

  doc.save(`${nomeArquivo}.pdf`)
}

/** Atalho pra PDF de uma seção só — mesmo formato, sem precisar montar o array de seções na mão. */
export function exportarPdfSecaoUnica(
  nomeArquivo: string,
  titulo: string,
  contexto: string[],
  colunaRotulo: string,
  colunaValor: string,
  linhas: LinhaPdf[],
  imagem?: ImagemGrafico | null,
) {
  exportarPdf(nomeArquivo, titulo, contexto, [{ titulo, colunaRotulo, colunaValor, linhas, imagem }])
}
