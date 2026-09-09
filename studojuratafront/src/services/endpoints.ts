/**
 * Mapa dos endpoints do StudoJurataApi.
 *
 * Cada função corresponde a uma rota real de um @RestController. As telas só
 * conversam com o back através daqui — nenhuma página monta URL na mão.
 */

import { api } from './api'
import type {
  Aluno,
  AlunoTurma,
  Aula,
  AulaConteudo,
  AlternativaRequest,
  AlternativaResponse,
  ChamadaRequest,
  ConteudoPlano,
  Curso,
  CursoDisciplina,
  Disciplina,
  Escola,
  EstatisticasPlanoAula,
  Evento,
  FinalizarSimuladoRequest,
  Frequencia,
  GerarSimuladoIARequest,
  HorarioTurma,
  LancarSimuladoRequest,
  LoginRequest,
  LoginResponse,
  Nota,
  Pessoa,
  PlanoAula,
  PlanoEnsino,
  PontuacaoAluno,
  Professor,
  QuestaoAlunoRequest,
  QuestaoAlunoResponse,
  QuestaoConteudo,
  QuestaoRequest,
  QuestaoResponse,
  Recomendacao,
  Responsavel,
  ResponsavelAluno,
  RevisaoConteudoResponse,
  RegistrarReforcoRequest,
  SimuladoAlunoRequest,
  SimuladoAlunoResponse,
  SimuladoGeradoIAResponse,
  SimuladoQuestaoRequest,
  SimuladoQuestaoResponse,
  SimuladoRequest,
  SimuladoResponse,
  Skin,
  SkinAluno,
  Turma,
  TurmaDisciplina,
  TurmaDisciplinaSubstituto,
  Usuario,
} from '../types'

// ---------------------------------------------------------------------------
// Autenticação — /auth
// ---------------------------------------------------------------------------

export const autenticacao = {
  entrar: (dados: LoginRequest) => api.post<LoginResponse>('/auth/login', dados),
  sair: () => api.post<void>('/auth/logout'),
  usuarioAtual: () => api.get<LoginResponse>('/auth/me'),
}

// ---------------------------------------------------------------------------
// Cadastros de pessoas
// ---------------------------------------------------------------------------

export const pessoas = {
  listar: () => api.get<Pessoa[]>('/pessoas'),
  buscar: (id: number) => api.get<Pessoa>(`/pessoas/${id}`),
  criar: (dados: Partial<Pessoa>) => api.post<Pessoa>('/pessoas', dados),
  atualizar: (id: number, dados: Partial<Pessoa>) => api.put<Pessoa>(`/pessoas/${id}`, dados),
  excluir: (id: number) => api.delete(`/pessoas/${id}`),
}

export const alunos = {
  listar: () => api.get<Aluno[]>('/alunos'),
  buscar: (id: number) => api.get<Aluno>(`/alunos/${id}`),
  criar: (dados: Partial<Aluno>) => api.post<Aluno>('/alunos', dados),
  atualizar: (id: number, dados: Partial<Aluno>) => api.put<Aluno>(`/alunos/${id}`, dados),
  excluir: (id: number) => api.delete(`/alunos/${id}`),
}

export const professores = {
  listar: () => api.get<Professor[]>('/professores'),
  buscar: (id: number) => api.get<Professor>(`/professores/${id}`),
  turmasLecionadas: (id: number) => api.get<TurmaDisciplina[]>(`/professores/${id}/turmas`),
  criar: (dados: Partial<Professor>) => api.post<Professor>('/professores', dados),
  atualizar: (id: number, dados: Partial<Professor>) =>
    api.put<Professor>(`/professores/${id}`, dados),
  excluir: (id: number) => api.delete(`/professores/${id}`),
}

export const responsaveis = {
  listar: () => api.get<Responsavel[]>('/responsaveis'),
  buscar: (id: number) => api.get<Responsavel>(`/responsaveis/${id}`),
  criar: (dados: Partial<Responsavel>) => api.post<Responsavel>('/responsaveis', dados),
  atualizar: (id: number, dados: Partial<Responsavel>) =>
    api.put<Responsavel>(`/responsaveis/${id}`, dados),
  excluir: (id: number) => api.delete(`/responsaveis/${id}`),
}

export const vinculosResponsavel = {
  listar: () => api.get<ResponsavelAluno[]>('/responsavel-aluno'),
  porAluno: (alunoId: number) => api.get<ResponsavelAluno[]>(`/responsavel-aluno/por-aluno/${alunoId}`),
  porResponsavel: (responsavelId: number) =>
    api.get<ResponsavelAluno[]>(`/responsavel-aluno/por-responsavel/${responsavelId}`),
  criar: (dados: Partial<ResponsavelAluno>) =>
    api.post<ResponsavelAluno>('/responsavel-aluno', dados),
  atualizar: (id: number, dados: Partial<ResponsavelAluno>) =>
    api.put<ResponsavelAluno>(`/responsavel-aluno/${id}`, dados),
  aceitarTermos: (id: number, textoVersao: string) =>
    api.post<ResponsavelAluno>(`/responsavel-aluno/${id}/aceitar-termos`, { textoVersao }),
  excluir: (id: number) => api.delete(`/responsavel-aluno/${id}`),
}

export const usuarios = {
  listar: () => api.get<Usuario[]>('/usuarios'),
  buscar: (id: number) => api.get<Usuario>(`/usuarios/${id}`),
  criar: (dados: Partial<Usuario>) => api.post<Usuario>('/usuarios', dados),
  atualizar: (id: number, dados: Partial<Usuario>) => api.put<Usuario>(`/usuarios/${id}`, dados),
  excluir: (id: number) => api.delete(`/usuarios/${id}`),
}

export const escolas = {
  listar: () => api.get<Escola[]>('/escolas'),
  buscar: (id: number) => api.get<Escola>(`/escolas/${id}`),
  criar: (dados: Partial<Escola>) => api.post<Escola>('/escolas', dados),
  atualizar: (id: number, dados: Partial<Escola>) => api.put<Escola>(`/escolas/${id}`, dados),
  excluir: (id: number) => api.delete(`/escolas/${id}`),
}

// ---------------------------------------------------------------------------
// Estrutura pedagógica
// ---------------------------------------------------------------------------

export const cursos = {
  listar: () => api.get<Curso[]>('/cursos'),
  buscar: (id: number) => api.get<Curso>(`/cursos/${id}`),
  planosDeEnsino: (id: number) => api.get<PlanoEnsino[]>(`/cursos/${id}/planos-ensino`),
  disciplinas: (id: number) => api.get<CursoDisciplina[]>(`/cursos/${id}/disciplinas`),
  criar: (dados: Partial<Curso>) => api.post<Curso>('/cursos', dados),
  atualizar: (id: number, dados: Partial<Curso>) => api.put<Curso>(`/cursos/${id}`, dados),
  excluir: (id: number) => api.delete(`/cursos/${id}`),
}

/** Grade curricular: disciplinas + carga horária de cada curso (ver CursoDisciplina). */
export const cursoDisciplinas = {
  listar: () => api.get<CursoDisciplina[]>('/curso-disciplina'),
  listarPorCurso: (cursoId: number) => cursos.disciplinas(cursoId),
  criar: (dados: Partial<CursoDisciplina>) => api.post<CursoDisciplina>('/curso-disciplina', dados),
  atualizar: (id: number, dados: Partial<CursoDisciplina>) =>
    api.put<CursoDisciplina>(`/curso-disciplina/${id}`, dados),
  excluir: (id: number) => api.delete(`/curso-disciplina/${id}`),
}

export const disciplinas = {
  listar: () => api.get<Disciplina[]>('/disciplinas'),
  buscar: (id: number) => api.get<Disciplina>(`/disciplinas/${id}`),
  criar: (dados: Partial<Disciplina>) => api.post<Disciplina>('/disciplinas', dados),
  atualizar: (id: number, dados: Partial<Disciplina>) =>
    api.put<Disciplina>(`/disciplinas/${id}`, dados),
  excluir: (id: number) => api.delete(`/disciplinas/${id}`),
}

export const turmas = {
  listar: () => api.get<Turma[]>('/turmas'),
  buscar: (id: number) => api.get<Turma>(`/turmas/${id}`),
  /** Derivado das matrículas — a Turma não persiste esse número. */
  alunosAtivos: (id: number) => api.get<number>(`/turmas/${id}/alunos-ativos`),
  criar: (dados: Partial<Turma>) => api.post<Turma>('/turmas', dados),
  atualizar: (id: number, dados: Partial<Turma>) => api.put<Turma>(`/turmas/${id}`, dados),
  excluir: (id: number) => api.delete(`/turmas/${id}`),
}

export const horariosTurma = {
  listarPorTurma: (turmaId: number) => api.get<HorarioTurma[]>(`/turmas/${turmaId}/horarios`),
  adicionar: (turmaId: number, dados: Partial<HorarioTurma>) =>
    api.post<HorarioTurma>(`/turmas/${turmaId}/horarios`, dados),
  remover: (id: number) => api.delete(`/horarios/${id}`),
}

export const turmaDisciplinas = {
  listar: () => api.get<TurmaDisciplina[]>('/turma-disciplina'),
  buscar: (id: number) => api.get<TurmaDisciplina>(`/turma-disciplina/${id}`),
  criar: (dados: Partial<TurmaDisciplina>) =>
    api.post<TurmaDisciplina>('/turma-disciplina', dados),
  atualizar: (id: number, dados: Partial<TurmaDisciplina>) =>
    api.put<TurmaDisciplina>(`/turma-disciplina/${id}`, dados),
  excluir: (id: number) => api.delete(`/turma-disciplina/${id}`),
}

export const turmaDisciplinaSubstitutos = {
  listarPorTurmaDisciplina: (turmaDisciplinaId: number) =>
    api.get<TurmaDisciplinaSubstituto[]>(`/turma-disciplina/${turmaDisciplinaId}/substitutos`),
  adicionar: (turmaDisciplinaId: number, professorId: number) =>
    api.post<TurmaDisciplinaSubstituto>(`/turma-disciplina/${turmaDisciplinaId}/substitutos`, {
      professor: { id: professorId },
    }),
  remover: (id: number) => api.delete(`/turma-disciplina-substituto/${id}`),
}

export const matriculas = {
  listar: () => api.get<AlunoTurma[]>('/aluno-turma'),
  buscar: (id: number) => api.get<AlunoTurma>(`/aluno-turma/${id}`),
  historicoPorTurma: (turmaId: number) =>
    api.get<AlunoTurma[]>(`/aluno-turma/turma/${turmaId}/historico`),
  ativosPorTurma: (turmaId: number) => api.get<AlunoTurma[]>(`/aluno-turma/turma/${turmaId}/ativos`),
  quantidadeAtivos: (turmaId: number) =>
    api.get<number>(`/aluno-turma/turma/${turmaId}/quantidade-ativos`),
  historicoPorAluno: (alunoId: number) =>
    api.get<AlunoTurma[]>(`/aluno-turma/aluno/${alunoId}/historico`),
  matricular: (dados: Partial<AlunoTurma>) => api.post<AlunoTurma>('/aluno-turma', dados),
  atualizar: (id: number, dados: Partial<AlunoTurma>) =>
    api.put<AlunoTurma>(`/aluno-turma/${id}`, dados),
  /** Soft delete: preserva o histórico pedagógico. */
  cancelar: (id: number, dataFim?: string) =>
    api.post<AlunoTurma>(`/aluno-turma/${id}/cancelar`, undefined, { dataFim }),
  concluir: (id: number, dataFim?: string) =>
    api.post<AlunoTurma>(`/aluno-turma/${id}/concluir`, undefined, { dataFim }),
  transferir: (id: number, turmaDestinoId: number, dataTransferencia?: string) =>
    api.post<AlunoTurma>(`/aluno-turma/${id}/transferir`, undefined, {
      turmaDestinoId,
      dataTransferencia,
    }),
}

export const planosEnsino = {
  listar: () => api.get<PlanoEnsino[]>('/plano-ensino'),
  buscar: (id: number) => api.get<PlanoEnsino>(`/plano-ensino/${id}`),
  criar: (dados: Partial<PlanoEnsino>) => api.post<PlanoEnsino>('/plano-ensino', dados),
  atualizar: (id: number, dados: Partial<PlanoEnsino>) =>
    api.put<PlanoEnsino>(`/plano-ensino/${id}`, dados),
  excluir: (id: number) => api.delete(`/plano-ensino/${id}`),
}

export const conteudosPlano = {
  listar: () => api.get<ConteudoPlano[]>('/conteudo-plano'),
  buscar: (id: number) => api.get<ConteudoPlano>(`/conteudo-plano/${id}`),
  criar: (dados: Partial<ConteudoPlano>) => api.post<ConteudoPlano>('/conteudo-plano', dados),
  atualizar: (id: number, dados: Partial<ConteudoPlano>) =>
    api.put<ConteudoPlano>(`/conteudo-plano/${id}`, dados),
  excluir: (id: number) => api.delete(`/conteudo-plano/${id}`),
}

export const planosAula = {
  listar: () => api.get<PlanoAula[]>('/plano-aula'),
  buscar: (id: number) => api.get<PlanoAula>(`/plano-aula/${id}`),
  listarPorTurmaDisciplina: (turmaDisciplinaId: number) =>
    api.get<PlanoAula[]>(`/plano-aula/turma-disciplina/${turmaDisciplinaId}`),
  estatisticas: (id: number) => api.get<EstatisticasPlanoAula>(`/plano-aula/${id}/estatisticas`),
  criar: (dados: Partial<PlanoAula>) => api.post<PlanoAula>('/plano-aula', dados),
  atualizar: (id: number, dados: Partial<PlanoAula>) =>
    api.put<PlanoAula>(`/plano-aula/${id}`, dados),
  excluir: (id: number) => api.delete(`/plano-aula/${id}`),
}

export const aulas = {
  listar: () => api.get<Aula[]>('/aulas'),
  buscar: (id: number) => api.get<Aula>(`/aulas/${id}`),
  listarPorPlanoAula: (planoAulaId: number) => api.get<Aula[]>(`/aulas/plano-aula/${planoAulaId}`),
  criar: (dados: Partial<Aula>) => api.post<Aula>('/aulas', dados),
  atualizar: (id: number, dados: Partial<Aula>) => api.put<Aula>(`/aulas/${id}`, dados),
  publicar: (id: number, dataPublicacao?: string) =>
    api.post<Aula>(`/aulas/${id}/publicar`, undefined, { dataPublicacao }),
  excluir: (id: number) => api.delete(`/aulas/${id}`),

  // Aba "Registrar conteúdo"
  listarConteudos: (id: number) => api.get<AulaConteudo[]>(`/aulas/${id}/conteudos`),
  vincularConteudo: (id: number, conteudoPlanoId: number) =>
    api.post<AulaConteudo>(`/aulas/${id}/conteudos/${conteudoPlanoId}`),
  desvincularConteudo: (id: number, conteudoPlanoId: number) =>
    api.delete(`/aulas/${id}/conteudos/${conteudoPlanoId}`),

  // Aba "Realizar chamada"
  listarFrequencias: (id: number) => api.get<Frequencia[]>(`/aulas/${id}/frequencias`),
  registrarChamada: (id: number, dados: ChamadaRequest) =>
    api.post<Frequencia[]>(`/aulas/${id}/frequencias/chamada`, dados),
}

export const frequencias = {
  listarPorAula: (aulaId: number) => api.get<Frequencia[]>(`/frequencia/aula/${aulaId}`),
  listarPorAluno: (alunoId: number) => api.get<Frequencia[]>(`/frequencia/aluno/${alunoId}`),
  excluir: (id: number) => api.delete(`/frequencia/${id}`),
}

// ---------------------------------------------------------------------------
// Notas e eventos
// ---------------------------------------------------------------------------

export const notas = {
  /** Restrito a PROFESSOR/ADMINISTRADOR no SecurityConfig. */
  listar: () => api.get<Nota[]>('/notas'),
  buscar: (id: number) => api.get<Nota>(`/notas/${id}`),
  historicoPorAluno: (alunoId: number) => api.get<Nota[]>(`/notas/aluno/${alunoId}/historico`),
  historicoPorAlunoEDisciplina: (alunoId: number, disciplinaId: number) =>
    api.get<Nota[]>(`/notas/aluno/${alunoId}/disciplina/${disciplinaId}/historico`),
  /** Único caminho de escrita: a nota é sempre derivada dos simulados. */
  recalcular: (alunoId: number, disciplinaId: number, turmaId: number) =>
    api.post<Nota>('/notas/recalcular', undefined, { alunoId, disciplinaId, turmaId }),
  excluir: (id: number) => api.delete(`/notas/${id}`),
}

export const eventos = {
  listar: () => api.get<Evento[]>('/eventos'),
  listarPendentes: () => api.get<Evento[]>('/eventos/pendentes'),
  listarConcluidos: () => api.get<Evento[]>('/eventos/concluidos'),
  buscar: (id: number) => api.get<Evento>(`/eventos/${id}`),
  criar: (dados: Partial<Evento>) => api.post<Evento>('/eventos', dados),
  atualizar: (id: number, dados: Partial<Evento>) => api.put<Evento>(`/eventos/${id}`, dados),
  excluir: (id: number) => api.delete(`/eventos/${id}`),
}

// ---------------------------------------------------------------------------
// Simulados
// ---------------------------------------------------------------------------

export const questoes = {
  listar: () => api.get<QuestaoResponse[]>('/questoes'),
  buscar: (id: number) => api.get<QuestaoResponse>(`/questoes/${id}`),
  listarPendentes: () => api.get<QuestaoResponse[]>('/questoes/pendentes'),
  criar: (dados: QuestaoRequest) => api.post<QuestaoResponse>('/questoes', dados),
  atualizar: (id: number, dados: QuestaoRequest) =>
    api.put<QuestaoResponse>(`/questoes/${id}`, dados),
  aprovar: (id: number) => api.post<QuestaoResponse>(`/questoes/${id}/aprovar`),
  rejeitar: (id: number) => api.post<QuestaoResponse>(`/questoes/${id}/rejeitar`),
  excluir: (id: number) => api.delete(`/questoes/${id}`),

  // Conteúdos vinculados (aba "Conteúdo" do QuestaoEditor) — sem esse
  // vínculo a questão fica fora do cálculo de desempenho por conteúdo que
  // decide o nível de reforço (RecomendacaoService, no back).
  listarConteudos: (id: number) => api.get<QuestaoConteudo[]>(`/questoes/${id}/conteudos`),
  vincularConteudo: (id: number, conteudoPlanoId: number) =>
    api.post<QuestaoConteudo>(`/questoes/${id}/conteudos/${conteudoPlanoId}`),
  desvincularConteudo: (id: number, conteudoPlanoId: number) =>
    api.delete(`/questoes/${id}/conteudos/${conteudoPlanoId}`),
}

export const alternativas = {
  listar: () => api.get<AlternativaResponse[]>('/alternativas'),
  buscar: (id: number) => api.get<AlternativaResponse>(`/alternativas/${id}`),
  criar: (dados: AlternativaRequest) => api.post<AlternativaResponse>('/alternativas', dados),
  atualizar: (id: number, dados: AlternativaRequest) =>
    api.put<AlternativaResponse>(`/alternativas/${id}`, dados),
  excluir: (id: number) => api.delete(`/alternativas/${id}`),
}

export const simulados = {
  listar: () => api.get<SimuladoResponse[]>('/simulados'),
  buscar: (id: number) => api.get<SimuladoResponse>(`/simulados/${id}`),
  criar: (dados: SimuladoRequest) => api.post<SimuladoResponse>('/simulados', dados),
  atualizar: (id: number, dados: SimuladoRequest) =>
    api.put<SimuladoResponse>(`/simulados/${id}`, dados),
  /** Cria um SimuladoAluno PENDENTE para cada aluno elegível. */
  lancar: (id: number, dados?: LancarSimuladoRequest) =>
    api.post<SimuladoResponse>(`/simulados/${id}/lancar`, dados ?? {}),
  encerrar: (id: number) => api.post<SimuladoResponse>(`/simulados/${id}/encerrar`),
  excluir: (id: number) => api.delete(`/simulados/${id}`),
}

export const simuladoQuestoes = {
  listar: () => api.get<SimuladoQuestaoResponse[]>('/simulado-questao'),
  buscar: (id: number) => api.get<SimuladoQuestaoResponse>(`/simulado-questao/${id}`),
  criar: (dados: SimuladoQuestaoRequest) =>
    api.post<SimuladoQuestaoResponse>('/simulado-questao', dados),
  atualizar: (id: number, dados: SimuladoQuestaoRequest) =>
    api.put<SimuladoQuestaoResponse>(`/simulado-questao/${id}`, dados),
  /** Soft delete: preserva o histórico de respostas dos alunos. */
  remover: (id: number) => api.post<SimuladoQuestaoResponse>(`/simulado-questao/${id}/remover`),
  excluir: (id: number) => api.delete(`/simulado-questao/${id}`),
}

export const simuladoAlunos = {
  listar: () => api.get<SimuladoAlunoResponse[]>('/simulado-aluno'),
  buscar: (id: number) => api.get<SimuladoAlunoResponse>(`/simulado-aluno/${id}`),
  listarPorAluno: (alunoId: number) =>
    api.get<SimuladoAlunoResponse[]>(`/simulado-aluno/aluno/${alunoId}`),
  listarPorSimulado: (simuladoId: number) =>
    api.get<SimuladoAlunoResponse[]>(`/simulado-aluno/simulado/${simuladoId}`),
  criar: (dados: SimuladoAlunoRequest) =>
    api.post<SimuladoAlunoResponse>('/simulado-aluno', dados),
  /** Calcula nota, acertos e tempo gasto. Questões ausentes contam como erro. */
  finalizar: (id: number, dados: FinalizarSimuladoRequest) =>
    api.post<SimuladoAlunoResponse>(`/simulado-aluno/${id}/finalizar`, dados),
  excluir: (id: number) => api.delete(`/simulado-aluno/${id}`),
}

export const questaoAlunos = {
  listar: () => api.get<QuestaoAlunoResponse[]>('/questao-aluno'),
  buscar: (id: number) => api.get<QuestaoAlunoResponse>(`/questao-aluno/${id}`),
  listarPorSimuladoAluno: (simuladoAlunoId: number) =>
    api.get<QuestaoAlunoResponse[]>(`/questao-aluno/simulado-aluno/${simuladoAlunoId}`),
  criar: (dados: QuestaoAlunoRequest) => api.post<QuestaoAlunoResponse>('/questao-aluno', dados),
  atualizar: (id: number, dados: QuestaoAlunoRequest) =>
    api.put<QuestaoAlunoResponse>(`/questao-aluno/${id}`, dados),
  excluir: (id: number) => api.delete(`/questao-aluno/${id}`),
}

// ---------------------------------------------------------------------------
// Gamificação — /gamificacao
// ---------------------------------------------------------------------------

export const gamificacao = {
  pontuacao: (alunoId: number) => api.get<PontuacaoAluno>(`/gamificacao/aluno/${alunoId}/pontuacao`),
  skinsDisponiveis: () => api.get<Skin[]>('/gamificacao/skins'),
  skinsDoAluno: (alunoId: number) => api.get<SkinAluno[]>(`/gamificacao/aluno/${alunoId}/skins`),
  comprar: (alunoId: number, skinId: number) =>
    api.post<SkinAluno>(`/gamificacao/aluno/${alunoId}/skins/${skinId}/comprar`),
  equipar: (alunoId: number, skinId: number) =>
    api.post<SkinAluno>(`/gamificacao/aluno/${alunoId}/skins/${skinId}/equipar`),
}

// ---------------------------------------------------------------------------
// Módulo de IA — /ia (restrito a PROFESSOR/ADMINISTRADOR)
// ---------------------------------------------------------------------------

export const ia = {
  gerarSimulado: (dados: GerarSimuladoIARequest) =>
    api.post<SimuladoResponse>('/ia/geracao/simulado', dados),
  /** Vínculo aluno/conteúdo/motivo de cada simulado já gerado pela IA — pra juntar com a lista de aprovação por simuladoId. */
  listarSimuladosGerados: () => api.get<SimuladoGeradoIAResponse[]>('/ia/geracao/simulado'),
  recomendacoesPorAluno: (alunoId: number) =>
    api.get<Recomendacao[]>(`/ia/recomendacoes/aluno/${alunoId}`),
  revisoesPorAluno: (alunoId: number) =>
    api.get<RevisaoConteudoResponse[]>(`/ia/revisao-conteudo/aluno/${alunoId}`),
  revisoesDevidasHoje: () => api.get<RevisaoConteudoResponse[]>('/ia/revisao-conteudo/devidos'),
  revisoesDevidasHojePorAluno: (alunoId: number) =>
    api.get<RevisaoConteudoResponse[]>(`/ia/revisao-conteudo/devidos/aluno/${alunoId}`),
  registrarReforco: (dados: RegistrarReforcoRequest) =>
    api.post<RevisaoConteudoResponse>('/ia/revisao-conteudo/registrar', dados),
}
