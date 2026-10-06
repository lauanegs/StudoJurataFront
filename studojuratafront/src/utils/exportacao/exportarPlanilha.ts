import ExcelJS from 'exceljs'

import { theme as tokens } from '@/styles/theme'
import type { ImagemGrafico } from '@/components/graficos/RenderizarGrafico'

import type { LinhaPlanilha, AbaPlanilha } from './types'
const paraArgb = (hex: string) => `FF${hex.replace('#', '')}`

const ROXO_MARCA_ARGB = paraArgb(tokens.colors.purple)
const BRANCO_ARGB = paraArgb(tokens.colors.white)
const LISTRA_ARGB = paraArgb(tokens.colors.background)
const BORDA_ARGB = paraArgb(tokens.colors.borderStrong)

const LARGURA_COLUNA_ROTULO = 52
const LARGURA_COLUNA_VALOR = 20
const ALTURA_LINHA_PADRAO_PX = 20
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

export function exportarExcel(
  nomeArquivo: string,
  colunaRotulo: string,
  colunaValor: string,
  linhas: LinhaPlanilha[],
  imagem?: ImagemGrafico | null,
) {
  return exportarExcelAbas(nomeArquivo, [{ nome: 'Dados', colunaRotulo, colunaValor, linhas, imagem }])
}

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
