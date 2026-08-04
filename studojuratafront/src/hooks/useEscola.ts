import { useMemo } from 'react'

import { escolas } from '../services/endpoints'
import { useRequisicao } from './useRequisicao'

/**
 * Escola do tenant atual.
 *
 * Curso, Disciplina, Turma e Usuario têm `escola` obrigatória no back, mas
 * nenhum endpoint devolve "a escola do usuário logado". Como /escolas é
 * restrito ao Administrador e o produto opera com uma escola por instalação,
 * usamos a primeira da lista. Se um dia houver mais de uma, o formulário
 * precisará de um seletor — por isso `varias` é exposto aqui.
 */
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
