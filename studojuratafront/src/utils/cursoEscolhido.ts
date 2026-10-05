const PREFIXO = 'sj-curso-aluno-'

export const chaveDoCursoEscolhido = (pessoaId?: number) => `${PREFIXO}${pessoaId ?? 'x'}`

/**
 * A escolha de curso do aluno vale só até o próximo login: a cada entrada a tela de
 * escolha aparece de novo. Chamada ao entrar e ao sair.
 */
export function esquecerCursoEscolhido() {
  try {
    Object.keys(sessionStorage)
      .filter((chave) => chave.startsWith(PREFIXO))
      .forEach((chave) => sessionStorage.removeItem(chave))
  } catch {
    // sem storage não há o que esquecer
  }
}
