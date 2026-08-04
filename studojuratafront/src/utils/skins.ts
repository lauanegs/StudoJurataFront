const MAPA_SKIN_ASSET: Record<string, string> = {
  classico: '/images/skin1.png',
  explorador: '/images/skin2.png',
  cientista: '/images/skin3.png',
}

/**
 * O back devolve `Skin.urlAsset` como um caminho relativo (ex.: "skins/classico.png")
 * que não corresponde a nenhum arquivo servido pelo front. Mapeamos pelo nome
 * do arquivo para as imagens reais em `public/images` (skin1/skin2/skin3).
 */
export function resolverImagemSkin(urlAsset?: string | null): string {
  if (urlAsset) {
    const chave = Object.keys(MAPA_SKIN_ASSET).find((nome) => urlAsset.includes(nome))
    if (chave) return MAPA_SKIN_ASSET[chave]
  }

  return '/images/skin1.png'
}
