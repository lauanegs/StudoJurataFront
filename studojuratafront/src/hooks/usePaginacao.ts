import { useMemo, useState } from 'react'

export function usePaginacao<T>(itens: T[], porPagina = 5) {
  const [paginaEscolhida, setPagina] = useState(1)

  const totalPaginas = Math.max(1, Math.ceil(itens.length / porPagina))

  const pagina = Math.min(paginaEscolhida, totalPaginas)

  const itensDaPagina = useMemo(() => {
    const inicio = (pagina - 1) * porPagina
    return itens.slice(inicio, inicio + porPagina)
  }, [itens, pagina, porPagina])

  const primeiro = itens.length === 0 ? 0 : (pagina - 1) * porPagina + 1
  const ultimo = Math.min(pagina * porPagina, itens.length)

  return {
    pagina,
    totalPaginas,
    itensDaPagina,
    total: itens.length,
    label: itens.length === 0 ? 'Nenhum registro' : `${primeiro} - ${ultimo} de ${itens.length}`,
    irPara: (novaPagina: number) => setPagina(Math.min(Math.max(1, novaPagina), totalPaginas)),
    anterior: () => setPagina((atual) => Math.max(1, atual - 1)),
    proxima: () => setPagina((atual) => Math.min(totalPaginas, atual + 1)),
    temAnterior: pagina > 1,
    temProxima: pagina < totalPaginas,
    reiniciar: () => setPagina(1),
  }
}
