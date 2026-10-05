const MAPA_SKIN_ASSET: Record<string, string> = {
  classico: 'jura',
  explorador: 'bit',
  cientista: 'lia',
}

export type ReacaoSkin = 'neutro' | 'feliz' | 'triste'

/** Nome do arquivo de cada reação dentro da pasta da skin. */
const ARQUIVO_REACAO: Record<ReacaoSkin, string> = {
  neutro: 'padrao',
  feliz: 'feliz',
  triste: 'triste',
}

/**
 * O back devolve `Skin.urlAsset` como um caminho relativo (ex.: "skins/classico.png")
 * que não corresponde a nenhum arquivo servido pelo front. Mapeamos pelo nome
 * do arquivo para as imagens reais em `public/images/gamificacao/skins/<skin>/`.
 *
 * Cada skin tem 3 variantes de reação (padrao.png, feliz.png, triste.png)
 * — usadas no simulado para o mascote reagir de acordo com a resposta do aluno.
 */
export function resolverImagemSkin(
  urlAsset?: string | null,
  reacao: ReacaoSkin = 'neutro',
): string {
  const chave = urlAsset
    ? Object.keys(MAPA_SKIN_ASSET).find((nome) => urlAsset.includes(nome))
    : undefined

  const base = chave ? MAPA_SKIN_ASSET[chave] : 'jura'

  return `/images/gamificacao/skins/${base}/${ARQUIVO_REACAO[reacao]}.png`
}
