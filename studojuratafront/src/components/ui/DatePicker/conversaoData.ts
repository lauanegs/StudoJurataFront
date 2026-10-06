import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export const FORMATO_EXIBICAO_DATA = 'DD/MM/YYYY'
export const FORMATO_API_DATA = 'YYYY-MM-DD'
export const FORMATO_API_DATA_HORA = 'YYYY-MM-DDTHH:mm'

const FORMATOS_DE_ENTRADA = [FORMATO_EXIBICAO_DATA, 'D/M/YYYY', 'DD-MM-YYYY', 'DDMMYYYY']

export function dataDigitadaParaIso(texto: string): string | null {
  const data = dayjs(texto, FORMATOS_DE_ENTRADA, true)
  return data.isValid() ? data.format(FORMATO_API_DATA) : null
}

export function dataIsoParaExibicao(valor?: string | null): string {
  if (!valor) return ''

  const data = dayjs(valor)
  return data.isValid() ? data.format(FORMATO_EXIBICAO_DATA) : ''
}

export function mascararData(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 8)
  if (digitos.length <= 2) return digitos
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`
}
