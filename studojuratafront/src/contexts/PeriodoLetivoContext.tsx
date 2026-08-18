import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { useProfessorLogado } from '../hooks/usePerfilLogado'
import { matriculas, notas as servicoNotas, professores as servicoProfessores } from '../services/endpoints'
import { PeriodoLetivoContexto } from './periodoLetivoContexto'
import { useToast } from './toastContexto'

const CHAVE = '@studojurata:periodoLetivo'

/** "2026" ou "2026/1" a partir da data de hoje — primeiro semestre até junho. */
function periodoAtualPadrao(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}/${hoje.getMonth() < 6 ? 1 : 2}`
}

/**
 * Período letivo é um filtro global (sidebar, todos os perfis) — Planos de
 * Ensino/Aula e Notas passam a ser lidos nesse recorte em vez de um campo
 * duplicado em cada tela. Persistido em localStorage só pra não começar
 * vazio a cada sessão (não é fonte de verdade do back — não existe entidade
 * "período letivo" na API, é um recorte que este front impõe).
 *
 * Quando o PROFESSOR troca o período, todas as notas dos alunos das turmas
 * que ele leciona são recalculadas automaticamente para o novo período —
 * não existe mais botão manual de "Recalcular". Escopo: só o professor
 * logado (não a escola inteira) — é o que faz sentido pra quem está vendo a
 * tela, e evita um recálculo em massa de todo o sistema a cada troca.
 */
export function PeriodoLetivoProvider({ children }: { children: ReactNode }) {
  const [periodoLetivo, setPeriodoLetivo] = useState(
    () => window.localStorage.getItem(CHAVE) || periodoAtualPadrao(),
  )

  const { professorId } = useProfessorLogado()
  const toast = useToast()
  // Guarda o período já processado (não "já rodou uma vez"): o professorId
  // resolve de forma assíncrona (useProfessorLogado busca /professores),
  // então esse efeito reexecuta quando ele chega — um guard de "primeira
  // renderização" simples disparava o recálculo nesse segundo disparo,
  // mesmo sem o período ter mudado de verdade.
  const ultimoPeriodoProcessado = useRef(periodoLetivo)

  const definirPeriodoLetivo = useCallback((periodo: string) => {
    setPeriodoLetivo(periodo)
    window.localStorage.setItem(CHAVE, periodo)
  }, [])

  useEffect(() => {
    // Espera o professorId resolver antes de decidir qualquer coisa — senão,
    // um período mudado antes disso ficaria marcado como "processado" sem
    // o recálculo ter realmente rodado.
    if (!professorId) return
    if (ultimoPeriodoProcessado.current === periodoLetivo) return

    ultimoPeriodoProcessado.current = periodoLetivo

    let cancelado = false

    async function recalcularTudo() {
      try {
        const vinculos = await servicoProfessores.turmasLecionadas(professorId as number)

        await Promise.all(
          vinculos.map(async (vinculo) => {
            if (!vinculo.turma?.id || !vinculo.disciplina?.id) return

            const alunos = await matriculas.ativosPorTurma(vinculo.turma.id)
            await Promise.all(
              alunos.map((matricula) =>
                servicoNotas.recalcular(matricula.aluno.id, vinculo.disciplina!.id, periodoLetivo),
              ),
            )
          }),
        )

        if (!cancelado) {
          toast.success('Notas recalculadas', `Período ${periodoLetivo} atualizado em todas as suas turmas.`)
        }
      } catch {
        if (!cancelado) {
          toast.error('Não foi possível recalcular as notas do novo período')
        }
      }
    }

    void recalcularTudo()

    return () => {
      cancelado = true
    }
  }, [periodoLetivo, professorId, toast])

  const valor = useMemo(
    () => ({ periodoLetivo, definirPeriodoLetivo }),
    [periodoLetivo, definirPeriodoLetivo],
  )

  return <PeriodoLetivoContexto.Provider value={valor}>{children}</PeriodoLetivoContexto.Provider>
}
