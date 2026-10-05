import { SubtituloItem } from '@/components/ui/Header'

import { Lista } from './styles'
import type { ListaInfoProps } from './types'

/**
 * Lista de fatos (ícone + texto, um por linha) — mesmo padrão visual do
 * subtítulo do Header (SubtituloItem), reaproveitado fora dele pra dar
 * contexto no início de um modal ou de uma tela filtrável (ex.:
 * DetalheSimuladoModal, telas de detalhamento de desempenho do Reforço).
 */
export function ListaInfo({ itens }: ListaInfoProps) {
  return (
    <Lista>
      {itens.map((item, indice) => (
        <SubtituloItem key={indice} icon={item.icon}>
          {item.texto}
        </SubtituloItem>
      ))}
    </Lista>
  )
}
