import { useCallback, useMemo, useState } from 'react'

import type { Validador } from '../utils/validacao'

type Regras<T> = Partial<Record<keyof T, Validador<T[keyof T]>>>
type Erros<T> = Partial<Record<keyof T, string>>

interface OpcoesFormulario<T> {
  valoresIniciais: T
  regras?: Regras<T>
  /** Validações que dependem de mais de um campo (ex.: dataFim > dataInicio). */
  validarTudo?: (valores: T) => Erros<T>
}

/**
 * Estado, validação e estado de "tocado" de um formulário.
 *
 * O erro de um campo só aparece depois que o usuário sai dele (onBlur) ou
 * depois da primeira tentativa de envio — não enquanto ele ainda está
 * digitando pela primeira vez.
 */
export function useFormulario<T extends object>({
  valoresIniciais,
  regras = {},
  validarTudo,
}: OpcoesFormulario<T>) {
  const [valores, setValores] = useState<T>(valoresIniciais)
  const [tocados, setTocados] = useState<Partial<Record<keyof T, boolean>>>({})
  const [tentouEnviar, setTentouEnviar] = useState(false)

  const erros = useMemo<Erros<T>>(() => {
    const encontrados: Erros<T> = {}

    ;(Object.keys(regras) as (keyof T)[]).forEach((campo) => {
      const validador = regras[campo]
      if (!validador) return

      const erro = validador(valores[campo])
      if (erro) encontrados[campo] = erro
    })

    if (validarTudo) {
      Object.assign(encontrados, validarTudo(valores))
    }

    return encontrados
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valores])

  const valido = Object.keys(erros).length === 0

  const definirCampo = useCallback(<K extends keyof T>(campo: K, valor: T[K]) => {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }))
  }, [])

  const definirValores = useCallback((novos: Partial<T>) => {
    setValores((anteriores) => ({ ...anteriores, ...novos }))
  }, [])

  const marcarTocado = useCallback(<K extends keyof T>(campo: K) => {
    setTocados((anteriores) => ({ ...anteriores, [campo]: true }))
  }, [])

  const erroDe = useCallback(
    <K extends keyof T>(campo: K): string | undefined =>
      tocados[campo] || tentouEnviar ? erros[campo] : undefined,
    [erros, tocados, tentouEnviar],
  )

  /** Props prontas para <Input />, <Select />, <TextArea />. */
  const campo = useCallback(
    <K extends keyof T>(nome: K) => ({
      value: (valores[nome] ?? '') as T[K],
      erro: erroDe(nome),
      onBlur: () => marcarTocado(nome),
      onChange: (evento: { target: { value: string } } | string) => {
        const valor = typeof evento === 'string' ? evento : evento.target.value
        definirCampo(nome, valor as T[K])
      },
    }),
    [valores, erroDe, marcarTocado, definirCampo],
  )

  const reiniciar = useCallback(
    (novos?: T) => {
      setValores(novos ?? valoresIniciais)
      setTocados({})
      setTentouEnviar(false)
    },
    [valoresIniciais],
  )

  const aoEnviar = useCallback(
    (enviar: (valores: T) => void | Promise<void>) => async (evento?: { preventDefault: () => void }) => {
      evento?.preventDefault()
      setTentouEnviar(true)

      if (Object.keys(erros).length > 0) return false

      await enviar(valores)
      return true
    },
    [erros, valores],
  )

  return {
    valores,
    erros,
    valido,
    tentouEnviar,
    definirCampo,
    definirValores,
    marcarTocado,
    erroDe,
    campo,
    reiniciar,
    aoEnviar,
  }
}
