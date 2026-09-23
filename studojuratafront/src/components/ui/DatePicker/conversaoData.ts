import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// Sem o plugin, dayjs ignora o formato informado e cai no parser nativo, que
// não entende DD/MM/YYYY.
dayjs.extend(customParseFormat)

/** Formato mostrado e digitado no campo — o adotado pelo projeto. */
export const FORMATO_EXIBICAO_DATA = 'DD/MM/YYYY'

/** Formato que a API recebe e devolve (java.time.LocalDate). */
export const FORMATO_API_DATA = 'YYYY-MM-DD'

/** Formato que a API recebe e devolve para data+hora (java.time.LocalDateTime). */
export const FORMATO_API_DATA_HORA = 'YYYY-MM-DDTHH:mm'

/**
 * Formatos aceitos na digitação: sempre dia/mês/ano, com ou sem zero à
 * esquerda. O parser da Mantine sozinho aceitaria MM/DD/YYYY e ISO, o que
 * trocaria dia por mês sem avisar — por isso os formatos são declarados.
 */
const FORMATOS_DE_ENTRADA = [FORMATO_EXIBICAO_DATA, 'D/M/YYYY', 'DD-MM-YYYY', 'DDMMYYYY']

/**
 * Texto digitado -> valor que o formulário guarda e a API recebe.
 * `null` quando o texto não é uma data válida em dia/mês/ano — nesse caso o
 * campo mantém o que foi digitado (o valor só não é confirmado).
 */
export function dataDigitadaParaIso(texto: string): string | null {
  const data = dayjs(texto, FORMATOS_DE_ENTRADA, true)
  return data.isValid() ? data.format(FORMATO_API_DATA) : null
}

/**
 * Valor da API -> texto exibido no campo. É o que garante que a data continue
 * visível depois de perder o foco e depois de recarregar: o texto vem do valor
 * persistido, não do que estava digitado.
 */
export function dataIsoParaExibicao(valor?: string | null): string {
  if (!valor) return ''

  const data = dayjs(valor)
  return data.isValid() ? data.format(FORMATO_EXIBICAO_DATA) : ''
}
