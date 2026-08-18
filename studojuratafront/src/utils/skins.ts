const MAPA_SKIN_ASSET: Record<string, string> = {
  classico: 'skin1',
  explorador: 'skin2',
  cientista: 'skin3',
}

export type ReacaoSkin = 'neutro' | 'feliz' | 'triste'

/** Sufixo do arquivo por reação — "" mantém o nome-base (skin1.png). */
const SUFIXO_REACAO: Record<ReacaoSkin, string> = {
  neutro: '',
  feliz: 'feliz',
  triste: 'triste',
}

/**
 * O back devolve `Skin.urlAsset` como um caminho relativo (ex.: "skins/classico.png")
 * que não corresponde a nenhum arquivo servido pelo front. Mapeamos pelo nome
 * do arquivo para as imagens reais em `public/images` (skin1/skin2/skin3).
 *
 * Cada skin tem 3 variantes de reação (skin1.png, skin1feliz.png, skin1triste.png)
 * — usadas no simulado para o mascote reagir de acordo com a resposta do aluno.
 */
export function resolverImagemSkin(
  urlAsset?: string | null,
  reacao: ReacaoSkin = 'neutro',
): string {
  const chave = urlAsset
    ? Object.keys(MAPA_SKIN_ASSET).find((nome) => urlAsset.includes(nome))
    : undefined

  const base = chave ? MAPA_SKIN_ASSET[chave] : 'skin1'

  return `/images/${base}${SUFIXO_REACAO[reacao]}.png`
}
