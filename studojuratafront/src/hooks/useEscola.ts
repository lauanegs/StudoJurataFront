import { useMemo } from 'react'

import { escolas } from '@/dominios/curriculo/service'
import { useRequisicao } from './useRequisicao'

export function useEscola() {
  const { data, loading, error, reload } = useRequisicao(() => escolas.listar(), [])

  const lista = useMemo(() => data ?? [], [data])

  return {
    escola: lista[0] ?? null,
    escolas: lista,
    varias: lista.length > 1,
    loading,
    error,
    reload,
  }
}
