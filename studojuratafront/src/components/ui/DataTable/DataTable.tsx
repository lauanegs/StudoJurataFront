import { useMemo, useState } from 'react'
import { Group, Paper, Table } from '@mantine/core'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { ErroCarregamento } from '../../feedback/ErroCarregamento'
import { EstadoVazio } from '../../feedback/EstadoVazio'
import { Skeleton } from '../../feedback/Skeleton'
import { Paginacao } from '../Paginacao'
import { theme as tokens } from '../../../styles/theme'
import type { Coluna, DataTableProps } from './types'

type Direcao = 'asc' | 'desc'

/**
 * Tabela de dados com os quatro estados obrigatórios das telas: loading
 * (skeleton), erro (com "tentar novamente"), vazio (com ação) e preenchido.
 *
 * A ordenação é feita no cliente porque nenhum endpoint do back aceita
 * parâmetro de ordenação — todos devolvem a lista inteira. A Mantine só
 * fornece a casca visual (Table/Paper/Group); ordenar, paginar e os estados
 * continuam sendo lógica de domínio, não trocam com a biblioteca.
 */
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

  const paddingTd = `${densidade === 'compacta' ? tokens.spacing.xs : tokens.spacing.sm} ${tokens.spacing.lg}`

  if (error) {
    return (
      <Paper radius="md" shadow="md" style={{ width: '100%', overflow: 'hidden' }}>
        <ErroCarregamento mensagem={error} onRetry={onReload} />
      </Paper>
    )
  }

  return (
    <Paper radius="md" shadow="md" style={{ width: '100%', overflow: 'hidden' }}>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table
          aria-label={descricao}
          aria-busy={loading || undefined}
          highlightOnHover={Boolean(onRowClick)}
          highlightOnHoverColor={tokens.colors.background}
          withRowBorders
          styles={{
            table: { width: '100%' },
            thead: { background: 'rgba(230, 234, 242, 0.3)' },
            th: {
              padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semiBold,
              letterSpacing: '-0.8px',
              color: tokens.colors.textSecondary,
              whiteSpace: 'nowrap',
            },
            tr: { borderBottom: '2px solid rgba(115, 115, 115, 0.1)' },
            td: {
              padding: paddingTd,
              fontSize: tokens.typography.sizes.sm,
              color: tokens.colors.textSecondary,
              verticalAlign: 'middle',
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              {columns.map((coluna) => {
                const ativa = ordenacao?.key === coluna.key

                return (
                  <Table.Th
                    key={coluna.key}
                    scope="col"
                    className={
                      [coluna.ocultarEmTelaPequena && 'oculta-tela-pequena', coluna.ordenavel && 'coluna-ordenavel']
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                    style={{
                      width: coluna.largura,
                      textAlign: coluna.alinhamento ?? 'left',
                      cursor: coluna.ordenavel ? 'pointer' : undefined,
                      userSelect: coluna.ordenavel ? 'none' : undefined,
                    }}
                    aria-sort={
                      ativa ? (ordenacao.direcao === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                    onClick={() => alternarOrdenacao(coluna)}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing.xxs }}>
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
                    </span>
                  </Table.Th>
                )
              })}

              {actions && (
                // Sem width:1% — agora que os botões de ação podem quebrar linha
                // (ver Group abaixo), esse truque forçava a coluna a encolher pro
                // mínimo (um botão só) e quebrar sempre, mesmo sobrando espaço na
                // tabela. Sem largura fixa, a coluna cresce livremente e só quebra
                // quando realmente não há mais espaço.
                <Table.Th scope="col" style={{ textAlign: 'left' }}>
                  {rotuloColunaAcoes}
                </Table.Th>
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
                <Table.Tr
                  key={rowKey(item)}
                  tabIndex={onRowClick ? 0 : undefined}
                  style={{ cursor: onRowClick ? 'pointer' : undefined }}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={(evento) => {
                    if (onRowClick && (evento.key === 'Enter' || evento.key === ' ')) {
                      evento.preventDefault()
                      onRowClick(item)
                    }
                  }}
                >
                  {columns.map((coluna) => (
                    <Table.Td
                      key={coluna.key}
                      className={coluna.ocultarEmTelaPequena ? 'oculta-tela-pequena' : undefined}
                      style={{ textAlign: coluna.alinhamento ?? 'left' }}
                    >
                      {coluna.render(item)}
                    </Table.Td>
                  ))}

                  {actions && (
                    <Table.Td
                      style={{ textAlign: 'left' }}
                      onClick={(evento) => evento.stopPropagation()}
                    >
                      {/* Confirmado pelo usuário: quando os botões de ação não cabem
                          numa linha só, eles quebram pra linha(s) de baixo — nunca
                          forçam scroll horizontal na tabela nem ficam cortados. */}
                      <Group justify="flex-start" gap={tokens.spacing.xxs} wrap="wrap">
                        {actions(item)}
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </div>

      {!loading && dadosOrdenados.length === 0 && (
        <EstadoVazio
          titulo={empty?.titulo ?? 'Nenhum registro encontrado'}
          descricao={empty?.descricao}
          icon={empty?.icon}
          acao={empty?.acao}
        />
      )}

      {paginacao && !loading && dadosOrdenados.length > 0 && <Paginacao {...paginacao} />}
    </Paper>
  )
}
