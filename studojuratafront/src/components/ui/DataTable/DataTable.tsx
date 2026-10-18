import { useMemo, useState } from 'react'
import { Group, Table } from '@mantine/core'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { ErroCarregamento } from '@/components/feedback/ErroCarregamento'
import { EstadoVazio } from '@/components/feedback/EstadoVazio'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Paginacao } from '@/components/ui/Paginacao'
import { theme as tokens } from '@/styles/theme'
import {
  Cabecalho,
  CabecalhoAcoes,
  Celula,
  CelulaAcoes,
  Envelope,
  Linha,
  Rolagem,
  RotuloOrdenavel,
  Tabela,
} from './styles'
import type { Coluna, DataTableProps, Direcao } from './types'

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  error = null,
  onReload,
  empty,
  onRowClick,
  actions,
  rotuloColunaAcoes = 'Ações',
  quebrarAcoes = false,
  paginacao,
  densidade = 'confortavel',
  descricao,
  linhasSkeleton = 5,
}: DataTableProps<T>) {
  const [ordenacao, setOrdenacao] = useState<{ key: string; direcao: Direcao } | null>(null)

  const dadosOrdenados = useMemo(() => {
    if (!ordenacao) return data

    const coluna = columns.find((item) => item.key === ordenacao.key)
    if (!coluna?.valorOrdenacao) return data

    const copia = [...data]

    copia.sort((a, b) => {
      const valorA = coluna.valorOrdenacao?.(a)
      const valorB = coluna.valorOrdenacao?.(b)

      if (valorA === valorB) return 0
      if (valorA === null || valorA === undefined) return 1
      if (valorB === null || valorB === undefined) return -1

      const comparacao =
        typeof valorA === 'number' && typeof valorB === 'number'
          ? valorA - valorB
          : String(valorA).localeCompare(String(valorB), 'pt-BR', { sensitivity: 'base' })

      return ordenacao.direcao === 'asc' ? comparacao : -comparacao
    })

    return copia
  }, [data, columns, ordenacao])

  function alternarOrdenacao(coluna: Coluna<T>) {
    if (!coluna.ordenavel) return

    setOrdenacao((atual) => {
      if (atual?.key !== coluna.key) return { key: coluna.key, direcao: 'asc' }
      if (atual.direcao === 'asc') return { key: coluna.key, direcao: 'desc' }
      return null
    })
  }

  const totalColunas = columns.length + (actions ? 1 : 0)

  if (error) {
    return (
      <Envelope>
        <ErroCarregamento mensagem={error} onRetry={onReload} />
      </Envelope>
    )
  }

  return (
    <Envelope>
      <Rolagem>
        <Tabela
          aria-label={descricao}
          aria-busy={loading || undefined}
          highlightOnHover={Boolean(onRowClick)}
          highlightOnHoverColor={tokens.colors.background}
          withRowBorders
          $densidade={densidade}
        >
          <Table.Thead>
            <Table.Tr>
              {columns.map((coluna) => {
                const ativa = ordenacao?.key === coluna.key

                return (
                  <Cabecalho
                    key={coluna.key}
                    scope="col"
                    className={
                      [coluna.ocultarEmTelaPequena && 'oculta-tela-pequena', coluna.ordenavel && 'coluna-ordenavel']
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                    $largura={coluna.largura}
                    $alinhamento={coluna.alinhamento}
                    $ordenavel={coluna.ordenavel}
                    aria-sort={
                      ativa ? (ordenacao.direcao === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                    onClick={() => alternarOrdenacao(coluna)}
                  >
                    <RotuloOrdenavel>
                      {coluna.cabecalho}
                      {coluna.ordenavel &&
                        (ativa ? (
                          ordenacao.direcao === 'asc' ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )
                        ) : (
                          <ArrowUpDown size={14} opacity={0.4} />
                        ))}
                    </RotuloOrdenavel>
                  </Cabecalho>
                )
              })}

              {actions && (
                <CabecalhoAcoes scope="col" $quebrar={quebrarAcoes}>
                  {rotuloColunaAcoes}
                </CabecalhoAcoes>
              )}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading &&
              Array.from({ length: linhasSkeleton }).map((_, linha) => (
                <Table.Tr key={`skeleton-${linha}`}>
                  {Array.from({ length: totalColunas }).map((__, coluna) => (
                    <Table.Td key={coluna}>
                      <Skeleton $altura="14px" $largura={coluna === 0 ? '70%' : '45%'} />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}

            {!loading &&
              dadosOrdenados.map((item) => (
                <Linha
                  key={rowKey(item)}
                  tabIndex={onRowClick ? 0 : undefined}
                  $clicavel={Boolean(onRowClick)}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={(evento) => {
                    if (onRowClick && (evento.key === 'Enter' || evento.key === ' ')) {
                      evento.preventDefault()
                      onRowClick(item)
                    }
                  }}
                >
                  {columns.map((coluna) => (
                    <Celula
                      key={coluna.key}
                      className={coluna.ocultarEmTelaPequena ? 'oculta-tela-pequena' : undefined}
                      data-label={coluna.cabecalho}
                      $alinhamento={coluna.alinhamento}
                    >
                      {coluna.render(item)}
                    </Celula>
                  ))}

                  {actions && (
                    <CelulaAcoes $quebrar={quebrarAcoes} onClick={(evento) => evento.stopPropagation()}>
                      <Group justify="flex-start" gap={tokens.spacing.xxs} wrap={quebrarAcoes ? 'wrap' : 'nowrap'}>
                        {actions(item)}
                      </Group>
                    </CelulaAcoes>
                  )}
                </Linha>
              ))}
          </Table.Tbody>
        </Tabela>
      </Rolagem>

      {!loading && dadosOrdenados.length === 0 && (
        <EstadoVazio
          titulo={empty?.titulo ?? 'Nenhum registro encontrado'}
          descricao={empty?.descricao}
          icon={empty?.icon}
          acao={empty?.acao}
        />
      )}

      {paginacao && !loading && dadosOrdenados.length > 0 && <Paginacao {...paginacao} />}
    </Envelope>
  )
}
