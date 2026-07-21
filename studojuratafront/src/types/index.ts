export type TipoUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO'

export type StatusAtivoInativo = 'ATIVO' | 'INATIVO'

export interface Usuario {
  id: string
  nome: string
  tipoUsuario: TipoUsuario
}

export interface Disciplina {
  id: string
  nome: string
}

export interface Professor {
  id: string
  nome: string
  cpf: string
  dataNascimento: string
  celular: string
  email: string
  sexo: 'FEMININO' | 'MASCULINO'
  disciplinas: Disciplina[]
}

export interface Responsavel {
  id: string
  nome: string
  cpf: string
  dataNascimento: string
  celular: string
  email: string
  sexo: 'FEMININO' | 'MASCULINO'
}

export interface ResponsavelAluno {
  responsavelId: string
  parentesco: string
}

export interface Aluno {
  id: string
  nome: string
  cpf: string
  dataNascimento: string
  celular: string
  email: string
  sexo: 'FEMININO' | 'MASCULINO'
  idade: number
  responsaveis: ResponsavelAluno[]
}

export interface Turma {
  id: string
  titulo: string
  disciplinas: Disciplina[]
  professores: Professor[]
  dataInicio: string
  dataFim: string
  capacidadeMaxima: number
  status: StatusAtivoInativo
  alunosAtivos: number
}

export type StatusMatricula = 'ATIVA' | 'TRANSFERIDA' | 'CONCLUIDO' | 'CANCELADA'

export interface Matricula {
  id: string
  alunoId: string
  alunoNome: string
  idade: number
  turmaId: string
  dataInicio: string
  dataFim?: string
  status: StatusMatricula
}

export interface Evento {
  id: string
  titulo: string
  descricao: string
  dataHorario: string
  concluido: boolean
}

export interface PlanoEnsino {
  id: string
  turma: string
  curso: string
  disciplina: string
  periodoLetivo: string
  cargaHorariaTotal: string
  ementa: string
  objetivoGeral: string
}

export interface ConteudoPlanoEnsino {
  id: string
  planoEnsinoId: string
  ordem: number
  titulo: string
  conteudoDetalhado: string
}

export interface PlanoAula {
  id: string
  turma: string
  curso: string
  disciplina: string
  planoEnsino: string
  periodoLetivo: string
  cargaHorariaTotal: string
}

export interface Aula {
  id: string
  planoAulaId: string
  numero: number
  titulo: string
  dataPrevista: string
  quantidadeHorarios: number
  conteudos: string[]
  metodologias: string[]
  dataPublicacao?: string
  observacoes?: string
}

export type TipoQuestao = 'ALTERNATIVAS' | 'VERDADEIRO_FALSO'

export interface Alternativa {
  letra: string
  texto: string
  correta: boolean
}

export interface Questao {
  id: string
  tipo: TipoQuestao
  pergunta: string
  alternativas: Alternativa[]
  disciplina: string
}

export interface Simulado {
  id: string
  titulo: string
  disciplina: string
  turma?: string
  dataInicio: string
  dataFim: string
  questoes: Questao[]
  mediaGeral: number
  participacao: string
}

export interface SimuladoAlunoResultado {
  aluno: string
  acertos: string
  tempo: string
}

export interface Nota {
  disciplina: string
  notaTotal: string
  itens: { titulo: string; nota: string }[]
}
