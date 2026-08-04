import type { Pessoa } from '../../types'

export interface Aniversariante {
  id: number
  nome: string
  /** dd/MM formatado. */
  data: string
  hoje: boolean
  complemento: string
  /** Dias até o aniversário, usado para ordenar. */
  distancia: number
}

/**
 * Aniversariantes da semana.
 *
 * Não existe endpoint para isso no back — a lista é derivada de
 * `Pessoa.dataNascimento` dentro dos próximos `dias` dias, ignorando o ano.
 */
export function aniversariantesDaSemana(pessoas: Pessoa[], dias = 7): Aniversariante[] {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  return pessoas
    .flatMap((pessoa) => {
      if (!pessoa.dataNascimento) return []

      const nascimento = new Date(`${pessoa.dataNascimento.slice(0, 10)}T00:00:00`)
      if (Number.isNaN(nascimento.getTime())) return []

      // Próxima ocorrência do aniversário a partir de hoje.
      const proximo = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate())
      if (proximo < hoje) proximo.setFullYear(proximo.getFullYear() + 1)

      const distancia = Math.round((proximo.getTime() - hoje.getTime()) / 86_400_000)
      if (distancia > dias) return []

      const idadeQueFaz = proximo.getFullYear() - nascimento.getFullYear()

      return [
        {
          id: pessoa.id,
          nome: pessoa.nome,
          data: `${String(nascimento.getDate()).padStart(2, '0')}/${String(
            nascimento.getMonth() + 1,
          ).padStart(2, '0')}`,
          hoje: distancia === 0,
          complemento: `faz ${idadeQueFaz} anos`,
          distancia,
        },
      ]
    })
    .sort((a, b) => a.distancia - b.distancia)
}
