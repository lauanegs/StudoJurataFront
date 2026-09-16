import { useCallback, useState } from 'react'

const CHAVE_ARMAZENAMENTO = 'studojurata:avisos-dispensados'

function lerDispensados(): number[] {
  try {
    const bruto = localStorage.getItem(CHAVE_ARMAZENAMENTO)
    return bruto ? (JSON.parse(bruto) as number[]) : []
  } catch {
    return []
  }
}

/**
 * Lembra quais avisos (por id) o usuário já marcou como "ciente", persistindo
 * no navegador — usado pelo aviso de matrícula concluída por carga horária
 * (aba "Alunos ativos" da turma e tela do professor), pra não reaparecer
 * depois de dispensado.
 */
export function useAvisosDispensados() {
  const [dispensados, setDispensados] = useState<number[]>(lerDispensados)

  const dispensar = useCallback((id: number) => {
    setDispensados((atuais) => {
      const novos = Array.from(new Set([...atuais, id]))
      try {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(novos))
      } catch {
        // localStorage indisponível (ex.: modo privado) — o aviso só não persiste entre sessões.
      }
      return novos
    })
  }, [])

  return { dispensados, dispensar }
}
