/**
 * Espelho dos contratos do StudoJurataApi (Spring Boot).
 *
 * Cada bloco abaixo corresponde a uma entidade/DTO real do back-end. Os nomes
 * e a obrigatoriedade dos campos seguem exatamente os arquivos Java
 * (model/*.java, dto/*.java, model/enums/*.java). Não invente campos aqui:
 * se o back não devolve, a tela não deve exibir.
 */

// ---------------------------------------------------------------------------
// Enums (model/enums)
// ---------------------------------------------------------------------------

export type TipoUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO'
export type StatusAtivoInativo = 'ATIVO' | 'INATIVO'
export type StatusTurma = 'ATIVA' | 'INATIVA'
export type StatusMatricula = 'ATIVA' | 'CONCLUIDA' | 'CANCELADA' | 'TRANSFERIDA'
export type StatusQuestao = 'PENDENTE' | 'APROVADA' | 'REJEITADA'
export type StatusSimulado = 'RASCUNHO' | 'PUBLICADO' | 'ENCERRADO'
export type StatusSimuladoAluno = 'PENDENTE' | 'CONCLUIDO'
export type StatusSimuladoQuestao = 'ATIVA' | 'REMOVIDA'
export type TipoDestinacaoSimulado = 'TODOS' | 'ESPECIFICO'
export type TipoQuestao = 'ALTERNATIVAS' | 'VERDADEIRO_FALSO'
export type NivelDificuldade = 'FACIL' | 'MEDIA' | 'DIFICIL'
export type OrigemQuestao = 'PROFESSOR' | 'IA'
export type Sexo = 'FEMININO' | 'MASCULINO'
export type DiaSemana = 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO' | 'DOMINGO'
export type Parentesco =
  | 'PAI'
  | 'MAE'
  | 'AVO'
  | 'AVOA'
  | 'TIO'
  | 'TIA'
  | 'IRMAO_IRMA'
  | 'TUTOR_LEGAL'
  | 'OUTRO'
export type NivelDominio = 'BAIXO' | 'MEDIO' | 'ALTO'
export type MotivoRecomendacao = 'REPETICAO_ESPACADA' | 'BAIXO_APROVEITAMENTO'

// ---------------------------------------------------------------------------
// Base (model/BaseEntity.java)
// ---------------------------------------------------------------------------

export interface EntidadeBase {
  id: number
  createdAt?: string
  updatedAt?: string
}

// ---------------------------------------------------------------------------
// Cadastros
// ---------------------------------------------------------------------------

export interface Escola extends EntidadeBase {
  nome: string
  cnpj?: string
  status?: StatusAtivoInativo
}

export interface Endereco {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  /** UF, 2 letras. */
  estado?: string
}

export interface Pessoa extends EntidadeBase {
  nome: string
  cpf: string
  dataNascimento?: string
  telefone?: string
  email?: string
  sexo?: Sexo
  status?: StatusAtivoInativo
  endereco?: Endereco | null
}

export interface Aluno extends EntidadeBase {
  pessoa: Pessoa
  matricula?: string
}

export interface Professor extends EntidadeBase {
  pessoa: Pessoa
  status?: StatusAtivoInativo
}

export interface Responsavel extends EntidadeBase {
  pessoa: Pessoa
}

export interface ResponsavelAluno extends EntidadeBase {
  responsavel: Responsavel
  aluno: Aluno
  parentesco: Parentesco
  aceitouTermos?: boolean
  dataAceite?: string
  textoVersao?: string
}

export interface Usuario extends EntidadeBase {
  escola: Escola
  pessoa: Pessoa
  username: string
  /** O back nunca devolve a senha (@JsonIgnore); só é enviada na criação. */
  senha?: string
  tipoUsuario: TipoUsuario
  status?: StatusAtivoInativo
  aluno?: Aluno | null
  professor?: Professor | null
}

// ---------------------------------------------------------------------------
// Estrutura pedagógica
// ---------------------------------------------------------------------------

export interface Curso extends EntidadeBase {
  escola: Escola
  nome: string
  descricao?: string
  cargaHorariaTotal?: number
  status?: StatusAtivoInativo
}

export interface Disciplina extends EntidadeBase {
  escola: Escola
  titulo: string
  status?: StatusAtivoInativo
}

export interface Turma extends EntidadeBase {
  escola: Escola
  titulo: string
  capacidadeMaxima?: number
  curso: Curso
  status?: StatusTurma
  dataInicio?: string
  dataFim?: string
}

export interface HorarioTurma extends EntidadeBase {
  turma?: Turma
  diaSemana: DiaSemana
  /** Formato HH:mm:ss vindo de java.time.LocalTime. */
  horaInicio: string
  horaFim: string
}

export interface TurmaDisciplina extends EntidadeBase {
  turma?: Turma
  disciplina?: Disciplina
  professor?: Professor
  status?: StatusAtivoInativo
}

export interface AlunoTurma extends EntidadeBase {
  aluno: Aluno
  turma: Turma
  dataInicio?: string
  dataFim?: string
  status?: StatusMatricula
  matriculaDestinoTransferencia?: AlunoTurma | null
}

export interface PlanoEnsino extends EntidadeBase {
  turmaDisciplina?: TurmaDisciplina | null
  titulo?: string
  curso: Curso
  cargaHoraria?: number
  periodoLetivo: string
  ementa?: string
  objetivoGeral?: string
  metodologia?: string
  dataInicio?: string
  dataFim?: string
  status?: StatusAtivoInativo
}

export interface ConteudoPlano extends EntidadeBase {
  planoEnsino?: PlanoEnsino | null
  titulo?: string
  descricao?: string
  ordem?: number
  cargaHoraria?: number
  status?: StatusAtivoInativo
}

export interface PlanoAula extends EntidadeBase {
  turmaDisciplina: TurmaDisciplina
  planoEnsino: PlanoEnsino
  status?: StatusAtivoInativo
}

export interface Aula extends EntidadeBase {
  planoAula: PlanoAula
  cargaHoraria?: number
  dataPrevista?: string
  ordem?: number
  titulo?: string
  dataPublicacao?: string
  observacoes?: string
  status?: StatusAtivoInativo
}

export interface AulaConteudo extends EntidadeBase {
  aula: Aula
  conteudoPlano: ConteudoPlano
}

export interface Frequencia extends EntidadeBase {
  aluno: Aluno
  aula: Aula
  presente: boolean
  justificativa?: string
}

/** Corpo de POST /aulas/{id}/frequencias/chamada (dto/ChamadaRequest.java). */
export interface ChamadaRequest {
  alunos: {
    alunoId: number
    presente: boolean
    justificativa?: string
  }[]
}

/** Estatísticas de GET /plano-aula/{id}/estatisticas (Map<String, Object>). */
export interface EstatisticasPlanoAula {
  [chave: string]: number | string | null
}

// ---------------------------------------------------------------------------
// Avaliação
// ---------------------------------------------------------------------------

export interface Nota extends EntidadeBase {
  aluno: Aluno
  disciplina: Disciplina
  periodoLetivo: string
  total?: number
  quantidadeSimuladosConsiderados?: number
}

export interface Evento extends EntidadeBase {
  titulo: string
  descricao?: string
  /** LocalDateTime — enviar/receber como "YYYY-MM-DDTHH:mm:ss". */
  dataHorario: string
  concluido: boolean
  criadoPor?: Usuario | null
}

// ---------------------------------------------------------------------------
// Simulados (trabalham com DTOs, não com a entidade completa)
// ---------------------------------------------------------------------------

export interface QuestaoRequest {
  enunciado: string
  tipo: TipoQuestao
  disciplinaId?: number | null
  nivelDificuldade?: NivelDificuldade | null
  origem?: OrigemQuestao | null
}

export interface QuestaoResponse {
  id: number
  enunciado: string
  tipo: TipoQuestao
  disciplinaId?: number | null
  nivelDificuldade?: NivelDificuldade | null
  origem?: OrigemQuestao | null
  status?: StatusQuestao
}

export interface AlternativaRequest {
  questaoId: number
  texto: string
  correta?: boolean
  ordem?: number
}

export interface AlternativaResponse {
  id: number
  questaoId: number
  texto: string
  correta?: boolean
  ordem?: number
}

export interface SimuladoRequest {
  titulo: string
  disciplinaId?: number | null
  planoEnsinoId?: number | null
  turmaId?: number | null
  tipoDestinacao: TipoDestinacaoSimulado
  /** LocalDateTime — "YYYY-MM-DDTHH:mm:ss". */
  dataInicio?: string | null
  dataFim?: string | null
  /** Em minutos. */
  tempoLimite?: number | null
  notaMaxima?: number | null
  quantidadeQuestoes?: number | null
  /** Correção do bug "nota não recalcula sem Plano de Ensino": obrigatório, próprio do Simulado. */
  periodoLetivo: string
}

export interface SimuladoResponse extends SimuladoRequest {
  id: number
  status?: StatusSimulado
  createdAt?: string
}

export interface SimuladoQuestaoRequest {
  simuladoId: number
  questaoId: number
  ordem?: number
  pontuacao?: number
}

export interface SimuladoQuestaoResponse {
  id: number
  simuladoId: number
  questaoId: number
  ordem?: number
  pontuacao?: number
  status?: StatusSimuladoQuestao
}

export interface SimuladoAlunoRequest {
  simuladoId: number
  alunoId: number
}

export interface SimuladoAlunoResponse {
  id: number
  simuladoId: number
  alunoId: number
  quantidadeAcertos?: number
  nota?: number
  /** Em segundos. */
  tempoGasto?: number
  finalizadoPorTempo?: boolean
  status?: StatusSimuladoAluno
}

export interface QuestaoAlunoRequest {
  simuladoAlunoId: number
  questaoId: number
  alternativaId?: number | null
  acertou?: boolean
  tempoResposta?: number
}

export interface QuestaoAlunoResponse {
  id: number
  simuladoAlunoId: number
  questaoId: number
  alternativaId?: number | null
  acertou?: boolean
  tempoResposta?: number
}

/** POST /simulados/{id}/lancar. */
export interface LancarSimuladoRequest {
  alunoIds?: number[]
}

/** POST /simulado-aluno/{id}/finalizar. */
export interface FinalizarSimuladoRequest {
  respostas: {
    questaoId: number
    /** Nulo quando a questão foi deixada em branco. */
    alternativaId: number | null
    tempoResposta?: number
  }[]
  /** Tempo total da tentativa, em segundos. */
  tempoGastoTotal: number
  finalizadoPorTempo: boolean
}

// ---------------------------------------------------------------------------
// Gamificação
// ---------------------------------------------------------------------------

export interface PontuacaoAluno extends EntidadeBase {
  aluno: Aluno
  moedas: number
}

export interface Skin extends EntidadeBase {
  nome: string
  descricao?: string
  custoMoedas: number
  urlAsset?: string
  disponivel: boolean
}

export interface SkinAluno extends EntidadeBase {
  aluno: Aluno
  skin: Skin
  dataAquisicao?: string
  ativa: boolean
}

// ---------------------------------------------------------------------------
// Módulo de IA
// ---------------------------------------------------------------------------

export interface RevisaoConteudoResponse {
  id: number
  alunoId: number
  conteudoPlanoId: number
  quantidadeReforcos?: number
  dataUltimoReforco?: string
  dataProximoReforco?: string
  nivelDominio?: NivelDominio
}

export interface Recomendacao {
  alunoId: number
  conteudoPlanoId: number
  conteudoTitulo: string
  motivos: MotivoRecomendacao[]
  taxaAcerto?: number
  dataProximoReforco?: string
}

export interface GerarSimuladoIARequest {
  alunoId: number
  conteudoPlanoId: number
  quantidadeQuestoes?: number
  nivelDificuldade?: NivelDificuldade
}

export interface RegistrarReforcoRequest {
  alunoId: number
  conteudoPlanoId: number
  nivelDominio?: NivelDominio
}

// ---------------------------------------------------------------------------
// Autenticação (dto/LoginRequest, dto/LoginResponse)
// ---------------------------------------------------------------------------

export interface LoginRequest {
  username: string
  senha: string
}

export interface LoginResponse {
  usuarioId: number
  username: string
  tipoUsuario: TipoUsuario
  pessoaId: number | null
  nomePessoa: string | null
}

// ---------------------------------------------------------------------------
// Auditoria
// ---------------------------------------------------------------------------

export interface AuditLog extends EntidadeBase {
  entidade?: string
  entidadeId?: number
  acao?: string
  usuario?: string
  detalhe?: string
}
