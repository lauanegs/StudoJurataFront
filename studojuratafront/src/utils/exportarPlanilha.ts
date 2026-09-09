import ExcelJS from 'exceljs'

import { theme as tokens } from '../styles/theme'
import type { ImagemGrafico } from './renderizarGrafico'

export interface LinhaPlanilha {
  rotulo: string
  valor: string | number
}

export interface AbaPlanilha {
  /** Vira o nome da aba no Excel — cortado em 31 caracteres (limite do formato .xlsx). */
  nome: string
  colunaRotulo: string
  colunaValor: string
  linhas: LinhaPlanilha[]
  /** Desenho do gráfico (Histograma/GraficoBarras/GraficoLinha, capturado via renderizarGraficoComoImagem) — opcional, some acima da tabela nesta aba. */
  imagem?: ImagemGrafico | null
}

/** #662E9B (roxo da marca), sem o "#" e com o alpha "FF" na frente — formato ARGB que o exceljs pede. */
const ROXO_MARCA_ARGB = 'FF662E9B'
const BRANCO_ARGB = 'FFFFFFFF'
const LISTRA_ARGB = `FF${tokens.colors.background.replace('#', '')}`
const BORDA_ARGB = `FF${tokens.colors.borderStrong.replace('#', '')}`

const LARGURA_COLUNA_ROTULO = 52
const LARGURA_COLUNA_VALOR = 20
/** Altura de linha padrão do Excel em px (~15pt a 96dpi) — usada só pra estimar quantas linhas em branco reservar sob a imagem. */
const ALTURA_LINHA_PADRAO_PX = 20
/** Largura de exibição da imagem embutida, em px — a altura é calculada mantendo a proporção capturada. */
const LARGURA_IMAGEM_PX = 520
const ALTURA_MAXIMA_IMAGEM_PX = 280

function nomeAbaValido(nome: string, usados: Set<string>): string {
  let nomeAba = nome.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Dados'
  let contador = 2
  while (usados.has(nomeAba)) {
    const sufixo = ` (${contador++})`
    nomeAba = nomeAba.slice(0, 31 - sufixo.length) + sufixo
  }
  usados.add(nomeAba)
  return nomeAba
}

function estilizarCabecalho(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { color: { argb: BRANCO_ARGB }, bold: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROXO_MARCA_ARGB } }
    cell.alignment = { vertical: 'middle', wrapText: true }
  })
  row.height = 20
}

function estilizarLinhaDado(row: ExcelJS.Row, indice: number) {
  row.eachCell((cell) => {
    cell.alignment = { vertical: 'top', wrapText: true }
    cell.border = { bottom: { style: 'thin', color: { argb: BORDA_ARGB } } }
    if (indice % 2 === 1) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LISTRA_ARGB } }
    }
  })
}

function adicionarAba(workbook: ExcelJS.Workbook, nomeAba: string, aba: AbaPlanilha) {
  const worksheet = workbook.addWorksheet(nomeAba)
  worksheet.getColumn(1).width = LARGURA_COLUNA_ROTULO
  worksheet.getColumn(2).width = LARGURA_COLUNA_VALOR
  worksheet.properties.defaultRowHeight = ALTURA_LINHA_PADRAO_PX

  let linhaAtual = 1

  // Gráfico (quando houver) fica ancorado acima da tabela — reserva linhas
  // em branco do tamanho dele antes de escrever o cabeçalho, senão a
  // imagem (que não empurra células, é só um desenho flutuante) ficaria
  // sobreposta ao texto.
  if (aba.imagem) {
    const proporcao = aba.imagem.largura / aba.imagem.altura
    let larguraImg = LARGURA_IMAGEM_PX
    let alturaImg = larguraImg / proporcao
    if (alturaImg > ALTURA_MAXIMA_IMAGEM_PX) {
      alturaImg = ALTURA_MAXIMA_IMAGEM_PX
      larguraImg = alturaImg * proporcao
    }

    const imageId = workbook.addImage({ base64: aba.imagem.dataUrl, extension: 'jpeg' })
    worksheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: larguraImg, height: alturaImg } })

    linhaAtual = Math.ceil(alturaImg / ALTURA_LINHA_PADRAO_PX) + 2
  }

  const linhaCabecalho = worksheet.getRow(linhaAtual)
  linhaCabecalho.values = [aba.colunaRotulo, aba.colunaValor]
  estilizarCabecalho(linhaCabecalho)
  linhaAtual += 1

  const linhas = aba.linhas.length > 0 ? aba.linhas : [{ rotulo: '—', valor: '—' }]
  linhas.forEach((linha, indice) => {
    const row = worksheet.getRow(linhaAtual)
    row.values = [linha.rotulo, linha.valor]
    estilizarLinhaDado(row, indice)
    linhaAtual += 1
  })

  worksheet.views = [{ state: 'frozen', ySplit: linhaCabecalho.number }]
}

/**
 * Exporta os valores exatos por trás de UM gráfico como .xlsx de verdade
 * (ExcelJS) — cabeçalho roxo da marca, listras alternadas e bordas, mesmo
 * padrão visual do PDF exportado ao lado. Opcionalmente inclui o desenho do
 * gráfico (não só a legenda/tabela) acima dos dados.
 */
export function exportarExcel(
  nomeArquivo: string,
  colunaRotulo: string,
  colunaValor: string,
  linhas: LinhaPlanilha[],
  imagem?: ImagemGrafico | null,
) {
  return exportarExcelAbas(nomeArquivo, [{ nome: 'Dados', colunaRotulo, colunaValor, linhas, imagem }])
}

/**
 * Exporta várias tabelas num único .xlsx, uma aba por seção — usado no
 * relatório completo (pedido explícito: "exportar todos os dados, todas as
 * seções, em arquivos organizados").
 */
export async function exportarExcelAbas(nomeArquivo: string, abas: AbaPlanilha[]) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'StudoJurata'
  workbook.created = new Date()

  const nomesUsados = new Set<string>()
  abas.forEach((aba) => adicionarAba(workbook, nomeAbaValido(aba.nome, nomesUsados), aba))

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${nomeArquivo}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
