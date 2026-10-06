const PREFIXO = 'sj-curso-aluno-'

export const chaveDoCursoEscolhido = (pessoaId?: number) => `${PREFIXO}${pessoaId ?? 'x'}`

export function esquecerCursoEscolhido() {
  try {
    Object.keys(sessionStorage)
      .filter((chave) => chave.startsWith(PREFIXO))
      .forEach((chave) => sessionStorage.removeItem(chave))
  } catch {
    // sem storage não há o que esquecer
  }
}
