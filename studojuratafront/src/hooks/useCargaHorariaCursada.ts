import { frequencias as servicoFrequencias, planosAula } from '../services/endpoints'
import type { AlunoTurma, TurmaDisciplina } from '../types'
import { useRequisicao } from './useRequisicao'

export interface CargaHorariaEFaltas {
  /** Soma das aulas já ministradas (frequência presente) em qualquer disciplina ativa da turma. */
  cargaHoraria: Map<number, number>
  /** Quantidade de aulas em que o aluno foi marcado ausente, no mesmo escopo. */
  faltas: Map<number, number>
}

/**
 * Carga horária já cursada e faltas de cada aluno numa turma — a partir das
 * mesmas frequências (presente/ausente) das aulas já ministradas em qualquer
 * disciplina ativa da turma. Usado tanto na visão do professor
 * (TurmaDetalhada) quanto do administrador (TurmaFormulario, aba "Alunos
 * ativos") — a segunda só consome `cargaHoraria`.
 */
export function useCargaHorariaCursada(
  matriculas: AlunoTurma[],
  vinculosDaTurma: TurmaDisciplina[],
  ativo = true,
) {
  return useRequisicao(
    async (): Promise<CargaHorariaEFaltas> => {
      if (matriculas.length === 0 || vinculosDaTurma.length === 0) {
        return { cargaHoraria: new Map(), faltas: new Map() }
      }

      const planosDaTurma = await Promise.all(
        vinculosDaTurma.map((vinculo) => planosAula.listarPorTurmaDisciplina(vinculo.id)),
      )
      const idsPlanosDaTurma = new Set(planosDaTurma.flat().map((plano) => plano.id))

      const frequenciasPorAluno = await Promise.all(
        matriculas.map((matricula) => servicoFrequencias.listarPorAluno(matricula.aluno.id)),
      )

      const cargaHoraria = new Map<number, number>()
      const faltas = new Map<number, number>()

      matriculas.forEach((matricula, indice) => {
        const frequenciasDaTurma = frequenciasPorAluno[indice].filter((frequencia) => {
          const idPlanoAula = frequencia.aula?.planoAula?.id
          return idPlanoAula !== undefined && idsPlanosDaTurma.has(idPlanoAula)
        })

        const total = frequenciasDaTurma
          .filter((frequencia) => frequencia.presente)
          .reduce((soma, frequencia) => soma + (frequencia.aula?.cargaHoraria ?? 0), 0)
        const quantidadeFaltas = frequenciasDaTurma.filter((frequencia) => !frequencia.presente).length

        cargaHoraria.set(matricula.aluno.id, total)
        faltas.set(matricula.aluno.id, quantidadeFaltas)
      })

      return { cargaHoraria, faltas }
    },
    [matriculas, vinculosDaTurma],
    { ativo },
  )
}
