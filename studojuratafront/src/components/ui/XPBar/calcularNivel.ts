export const XP_POR_NIVEL = 500

/**
 * Converte o XP total em nível e progresso.
 *
 * O back guarda apenas `PontuacaoAluno.xpTotal`; a divisão em níveis é uma
 * regra de apresentação definida no front.
 */
export function calcularNivel(xpTotal: number) {
  const total = Math.max(0, xpTotal)

  const nivel = Math.floor(total / XP_POR_NIVEL) + 1
  const xpNoNivel = total % XP_POR_NIVEL

  return {
    nivel,
    xpNoNivel,
    xpParaProximo: XP_POR_NIVEL,
    percentual: (xpNoNivel / XP_POR_NIVEL) * 100,
  }
}
