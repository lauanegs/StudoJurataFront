import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '../services/api'

interface RequestState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface RequestResult<T> extends RequestState<T> {
  /** Recarrega mantendo a tela montada (mostra o estado de carregamento). */
  reload: () => Promise<void>
  /** Atualiza os dados em memória sem ir ao servidor (updates otimistas). */
  setData: (updater: T | ((previous: T | null) => T | null)) => void
  /** true quando terminou de carregar e não há nada para exibir. */
  isEmpty: boolean
}

function isEmptyValue(data: unknown): boolean {
  if (data === null || data === undefined) return true
  if (Array.isArray(data)) return data.length === 0
  return false
}

/**
 * Carrega dados do back cuidando de loading, erro e cancelamento.
 *
 * O array `dependencias` funciona como no useEffect: quando muda, refaz a
 * requisição. Passe `{ ativo: false }` para segurar a chamada enquanto um
 * parâmetro obrigatório ainda não existe (ex.: id do aluno logado).
 */
export function useRequisicao<T>(
  buscar: () => Promise<T>,
  dependencias: unknown[] = [],
  opcoes: { ativo?: boolean } = {},
): RequestResult<T> {
  const { ativo = true } = opcoes

  const [state, setState] = useState<RequestState<T>>({
    data: null,
    loading: ativo,
    error: null,
  })

  const buscarRef = useRef(buscar)

  useEffect(() => {
    buscarRef.current = buscar
  })

  const montadoRef = useRef(true)
  const requisicaoAtual = useRef(0)

  useEffect(() => {
    montadoRef.current = true
    return () => {
      montadoRef.current = false
    }
  }, [])

  const executar = useCallback(async () => {
    if (!ativo) {
      setState({ data: null, loading: false, error: null })
      return
    }

    const idRequisicao = requisicaoAtual.current + 1
    requisicaoAtual.current = idRequisicao

    setState((previous) => ({ ...previous, loading: true, error: null }))

    try {
      const data = await buscarRef.current()

      if (!montadoRef.current || requisicaoAtual.current !== idRequisicao) return

      setState({ data, loading: false, error: null })
    } catch (error) {
      if (!montadoRef.current || requisicaoAtual.current !== idRequisicao) return

      const message =
        error instanceof ApiError ? error.message : 'Não foi possível carregar as informações.'

      setState({ data: null, loading: false, error: message })
    }
  }, [ativo])

  useEffect(() => {
    void executar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executar, ...dependencias])

  const setData = useCallback((updater: T | ((previous: T | null) => T | null)) => {
    setState((previous) => ({
      ...previous,
      data:
        typeof updater === 'function'
          ? (updater as (a: T | null) => T | null)(previous.data)
          : updater,
    }))
  }, [])

  return {
    ...state,
    reload: executar,
    setData,
    isEmpty: !state.loading && !state.error && isEmptyValue(state.data),
  }
}

/**
 * Executa uma ação de escrita (salvar, excluir, aprovar...) controlando o
 * estado de "enviando" para desabilitar o botão e evitar duplo clique.
 */
export function useAcao<Args extends unknown[], Retorno>(
  acao: (...args: Args) => Promise<Retorno>,
) {
  const [executando, setExecutando] = useState(false)
  const montadoRef = useRef(true)

  useEffect(() => {
    montadoRef.current = true
    return () => {
      montadoRef.current = false
    }
  }, [])

  const executar = useCallback(
    async (...args: Args): Promise<Retorno> => {
      setExecutando(true)
      try {
        return await acao(...args)
      } finally {
        if (montadoRef.current) setExecutando(false)
      }
    },
    [acao],
  )

  return { executar, executando }
}
