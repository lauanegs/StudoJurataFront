import type { EntidadeBase } from './comum'
import type { Disciplina } from './curriculo'
import type { Aluno } from './pessoas'
import type { Turma } from './turmas'

/**
 * Escopo por turma, não por período letivo. total vai de 0 a 100: soma das
 * notas dos simulados com notaMaxima > 0 (os de notaMaxima = 0 são só reforço).
 */
export interface Nota extends EntidadeBase {
  aluno: Aluno
  disciplina: Disciplina
  turma: Turma
  total?: number
  quantidadeSimuladosConsiderados?: number
}
