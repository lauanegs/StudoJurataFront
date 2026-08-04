import { useEffect, useRef } from 'react'

/**
 * Preenche o estado de um formulário assim que os dados chegam do back.
 *
 * Sem isso, cada tela de edição repetiria o mesmo `useEffect` de hidratação —
 * e correria o risco de sobrescrever o que o usuário já digitou a cada
 * re-render. O controle por referência garante que `aplicar` roda uma única
 * vez por objeto recebido: se o usuário editar e a requisição não mudar, nada
 * é sobrescrito.
 */
export function useHidratar<T>(dados: T | null | undefined, aplicar: (dados: T) => void) {
  const jaAplicado = useRef<T | null>(null)
  const aplicarRef = useRef(aplicar)

  useEffect(() => {
    aplicarRef.current = aplicar
  })

  useEffect(() => {
    if (!dados || jaAplicado.current === dados) return

    jaAplicado.current = dados
    aplicarRef.current(dados)
  }, [dados])
}
