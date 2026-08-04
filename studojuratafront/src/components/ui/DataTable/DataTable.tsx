import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { ErroCarregamento } from '../../feedback/ErroCarregamento'
import { EstadoVazio } from '../../feedback/EstadoVazio'
import { Skeleton } from '../../feedback/Skeleton'
import { Paginacao } from '../Paginacao'
import * as S from './styles'
import type { Coluna, DataTableProps } from './types'

type Direcao = 'asc' | 'desc'

/**
 * Tabela de dados com os quatro estados obrigatórios das telas: loading
 * (skeleton), erro (com "tentar novamente"), vazio (com ação) e preenchido.
 *
 * A ordenação é feita no cliente porque nenhum endpoint do back aceita
 * parâmetro de ordenação — todos devolvem a lista inteira.
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

  if (error) {
    return (
      <S.Container>
        <ErroCarregamento mensagem={error} onRetry={onReload} />
      </S.Container>
    )
  }

  return (
    <S.Container>
      <S.Rolagem>
        <S.Tabela aria-label={descricao} aria-busy={loading || undefined}>
          <S.Cabecalho>
            <tr>
              {columns.map((coluna) => {
                const ativa = ordenacao?.key === coluna.key

                return (
                  <S.Th
                    key={coluna.key}
                    scope="col"
                    $largura={coluna.largura}
                    $alinhamento={coluna.alinhamento}
                    $ordenavel={coluna.ordenavel}
                    $ocultarEmTelaPequena={coluna.ocultarEmTelaPequena}
                    aria-sort={
                      ativa ? (ordenacao.direcao === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                    onClick={() => alternarOrdenacao(coluna)}
                  >
                    <S.ConteudoTh>
                      {coluna.cabecalho}
                      {coluna.ordenavel &&
                        (ativa ? (
                          ordenacao.direcao === 'asc' ? (
                            <ArrowUp />
                          ) : (
                            <ArrowDown />
                          )
                        ) : (
                          <ArrowUpDown opacity={0.4} />
                        ))}
                    </S.ConteudoTh>
                  </S.Th>
                )
              })}

              {actions && (
                <S.Th scope="col" $alinhamento="right" $largura="120px">
                  {rotuloColunaAcoes}
                </S.Th>
              )}
            </tr>
          </S.Cabecalho>

          <tbody>
            {loading &&
              Array.from({ length: linhasSkeleton }).map((_, linha) => (
                <S.Tr key={`skeleton-${linha}`}>
                  {Array.from({ length: totalColunas }).map((__, coluna) => (
                    <S.Td key={coluna} $densidade={densidade}>
                      <Skeleton $altura="14px" $largura={coluna === 0 ? '70%' : '45%'} />
                    </S.Td>
                  ))}
                </S.Tr>
              ))}

            {!loading &&
              dadosOrdenados.map((item) => (
                <S.Tr
                  key={rowKey(item)}
                  $clicavel={Boolean(onRowClick)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={(evento) => {
                    if (onRowClick && (evento.key === 'Enter' || evento.key === ' ')) {
                      evento.preventDefault()
                      onRowClick(item)
                    }
                  }}
                >
                  {columns.map((coluna) => (
                    <S.Td
                      key={coluna.key}
                      $alinhamento={coluna.alinhamento}
                      $densidade={densidade}
                      $ocultarEmTelaPequena={coluna.ocultarEmTelaPequena}
                    >
                      {coluna.render(item)}
                    </S.Td>
                  ))}

                  {actions && (
                    <S.Td
                      $alinhamento="right"
                      $densidade={densidade}
                      onClick={(evento) => evento.stopPropagation()}
                    >
                      <S.CelulaAcoes>{actions(item)}</S.CelulaAcoes>
                    </S.Td>
                  )}
                </S.Tr>
              ))}
          </tbody>
        </S.Tabela>
      </S.Rolagem>

      {!loading && dadosOrdenados.length === 0 && (
        <EstadoVazio
          titulo={empty?.titulo ?? 'Nenhum registro encontrado'}
          descricao={empty?.descricao}
          icon={empty?.icon}
          acao={empty?.acao}
        />
      )}

      {paginacao && !loading && dadosOrdenados.length > 0 && <Paginacao {...paginacao} />}
    </S.Container>
  )
}
