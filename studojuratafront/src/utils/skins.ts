import type { ReacaoSkin } from './types'
const MAPA_SKIN_ASSET: Record<string, string> = {
  classico: 'jura',
  explorador: 'bit',
  cientista: 'lia',
}

const ARQUIVO_REACAO: Record<ReacaoSkin, string> = {
  neutro: 'padrao',
  feliz: 'feliz',
  triste: 'triste',
}

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
