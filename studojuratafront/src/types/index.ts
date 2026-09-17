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
/** Próprio de PlanoEnsino/PlanoAula — matrícula cíclica não tem "inativo", só "concluído" (ciclo fechado). */
export type StatusPlano = 'ATIVO' | 'CONCLUIDO'
export type StatusTurma = 'ATIVA' | 'INATIVA'
export type StatusMatricula = 'ATIVA' | 'CONCLUIDA' | 'CANCELADA'
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
  /** Só de escrita: o back nunca devolve a senha (@JsonProperty WRITE_ONLY). */
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
  /** Soma das cargas horárias ativas da grade curricular (CursoDisciplina) — não editável diretamente. */
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

/** Grade curricular: disciplinas do curso com a carga horária de cada uma. */
export interface CursoDisciplina extends EntidadeBase {
  curso: Curso
  disciplina: Disciplina
  cargaHoraria?: number
  status?: StatusAtivoInativo
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
}

export interface PlanoEnsino extends EntidadeBase {
  turmaDisciplina?: TurmaDisciplina | null
  /** Professor responsável pelo plano (turmaDisciplina é opcional). */
  professor?: Professor | null
  curso: Curso
  cargaHoraria?: number
  ementa?: string
  objetivoGeral?: string
  metodologia?: string
  dataInicio?: string
  dataFim?: string
  /** Matrícula cíclica: um plano não é "inativado", ele conclui o ciclo (a turma pode receber um novo plano). */
  status?: StatusPlano
}

export interface ConteudoPlano extends EntidadeBase {
  planoEnsino?: PlanoEnsino | null
  titulo?: string
  descricao?: string
  ordem?: number
  status?: StatusAtivoInativo
}

export interface PlanoAula extends EntidadeBase {
  turmaDisciplina: TurmaDisciplina
  planoEnsino: PlanoEnsino
  status?: StatusPlano
}

export interface Aula extends EntidadeBase {
  planoAula: PlanoAula
  /**
   * Horário semanal da turma a que esta aula corresponde — quando
   * informado, cargaHoraria abaixo é CALCULADA a partir dele (hora fim -
   * hora início) pelo back, não editável. Ausente só em aula fora do
   * horário fixo (reposição etc.), onde cargaHoraria continua digitada.
   */
  horarioTurma?: HorarioTurma | null
  /** Em horas, aceita fração (ex.: 1.5 = 1h30). */
  cargaHoraria?: number
  dataPrevista?: string
  ordem?: number
  titulo?: string
  dataPublicacao?: string
  observacoes?: string
  status?: StatusAtivoInativo
}

/**
 * Geração em lote de aulas pra um plano de aula — segue os horários já
 * cadastrados na turma (HorarioTurma), ciclando entre eles a partir de
 * dataInicio até completar a quantidade pedida.
 */
export interface GerarAulasLoteRequest {
  quantidade: number
  dataInicio?: string
  /** Vira "{tituloBase} {ordem}" em cada aula gerada — default "Aula" quando vazio. */
  tituloBase?: string
}

export interface AulaConteudo extends EntidadeBase {
  aula: Aula
  conteudoPlano: ConteudoPlano
}

/**
 * Vínculo questão-conteúdo (aba "Conteúdo" do QuestaoEditor) — alimenta o
 * cálculo de desempenho por conteúdo/nível que decide o reforço (back:
 * RecomendacaoService). `questao` só carrega o `id`: o endpoint devolve a
 * entidade completa, mas nada na tela usa mais que isso — o resto do dado da
 * questão já está no estado local do editor.
 */
export interface QuestaoConteudo extends EntidadeBase {
  questao: { id: number }
  conteudoPlano: ConteudoPlano
}

export interface Frequencia extends EntidadeBase {
  aluno: Aluno
  aula: Aula
  presente: boolean
  justificativa?: string
}

/** Resposta de GET /turmas/{id}/frequencia-alunos (FrequenciaService.ResumoFrequenciaAluno). */
export interface ResumoFrequenciaAluno {
  alunoId: number
  cargaHoraria: number
  faltas: number
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
  /** Só vem preenchido na resposta de finalizar() — dias até a próxima revisão por repetição espaçada (undefined se o simulado não cobre conteúdo rastreado, ou já dominado). */
  diasProximaRevisao?: number
}

export interface QuestaoAlunoResponse {
  id: number
  simuladoAlunoId: number
  questaoId: number
  alternativaId?: number | null
  /** Ids das afirmações que o aluno marcou como Verdadeiras (só questão VERDADEIRO_FALSO). */
  alternativasVerdadeirasIds?: number[]
  /** false = questão deixada em branco. Sem isso, "respondeu e errou tudo" em V/F fica indistinguível de "em branco". */
  respondida?: boolean
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
    /** Nulo quando a questão foi deixada em branco. Ignorado em questão VERDADEIRO_FALSO. */
    alternativaId: number | null
    /**
     * Só usado em questão VERDADEIRO_FALSO: ids das alternativas (afirmações)
     * marcadas como Verdadeiras — as demais contam como marcadas Falsas.
     */
    alternativasVerdadeiras?: number[]
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
  /** Só presente com motivo BAIXO_APROVEITAMENTO: nível de dificuldade mais fraco do aluno nesse conteúdo — o mesmo nível que a IA usa ao gerar o reforço, salvo escolha manual do professor. */
  nivelPrioritario?: NivelDificuldade
  dataProximoReforco?: string
}

export interface GerarSimuladoIARequest {
  alunoId: number
  conteudoPlanoId: number
  nivelDificuldade?: NivelDificuldade
  /** Motivo(s) da Recomendacao que originou esta chamada, quando houver (ver SimuladoGeradoIAResponse). */
  motivos?: MotivoRecomendacao[]
}

/** Vínculo aluno/conteúdo/motivo de um simulado gerado pela IA — GET /ia/geracao/simulado. */
export interface SimuladoGeradoIAResponse {
  simuladoId: number
  alunoId: number
  conteudoPlanoId: number
  conteudoTitulo: string
  motivos: MotivoRecomendacao[]
  /** Prazo pra revisar/lançar o simulado — passado isso sem lançar (Simulado.status ainda RASCUNHO), conta como atrasado. */
  prazoLancamento: string
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

