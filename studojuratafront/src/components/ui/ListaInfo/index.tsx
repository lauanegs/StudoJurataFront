import type { ReactNode } from 'react'
import styled from 'styled-components'

import { SubtituloItem } from '../Header'

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export interface ItemListaInfo {
  icon: ReactNode
  texto: ReactNode
}

interface ListaInfoProps {
  itens: ItemListaInfo[]
}

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
