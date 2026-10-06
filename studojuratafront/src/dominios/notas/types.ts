import type { EntidadeBase } from '@/dominios/comum/types'
import type { Disciplina } from '@/dominios/curriculo/types'
import type { Aluno } from '@/dominios/pessoas/types'
import type { Turma } from '@/dominios/turmas/types'

export interface Nota extends EntidadeBase {
  aluno: Aluno
  disciplina: Disciplina
  turma: Turma
  total?: number
  quantidadeSimuladosConsiderados?: number
}
