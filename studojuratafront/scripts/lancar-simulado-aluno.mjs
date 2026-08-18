#!/usr/bin/env node
/**
 * Cria um simulado com 5 questões e lança para um aluno específico.
 *
 * Reproduz, via chamadas diretas à API, o mesmo fluxo que a tela
 * professor/reforco/simulados/novo faz (ver SimuladoFormulario.tsx):
 *
 *   1. login (sessão por cookie — o back usa Spring Security)
 *   2. localizar o aluno pelo nome
 *   3. localizar a matrícula ATIVA dele (destinação "ESPECIFICO" exige uma turma)
 *   4. criar o simulado em RASCUNHO
 *   5. criar cada questão + suas alternativas, e vinculá-las ao simulado
 *   6. lançar o simulado só para esse aluno (POST /simulados/{id}/lancar)
 *
 * Uso:
 *   node scripts/lancar-simulado-aluno.mjs
 *
 * Requer Node 18+ (usa fetch nativo) e o back rodando (padrão: localhost:8080).
 * Ajuste a seção CONFIG abaixo antes de rodar.
 */

// ---------------------------------------------------------------------------
// CONFIG — ajuste aqui antes de rodar
// ---------------------------------------------------------------------------

const CONFIG = {
  /** Backend do StudoJurata. Sem prefixo /api — é o Vite que reescreve isso. */
  apiBaseUrl: process.env.SJ_API_URL ?? 'http://localhost:8080',

  /** Credenciais de quem lança o simulado — precisa ser PROFESSOR ou ADMINISTRADOR. */
  login: {
    username: process.env.SJ_USERNAME ?? 'professor',
    senha: process.env.SJ_SENHA ?? 'senha123',
  },

  /** Nome (ou parte dele) do aluno que vai receber o simulado. */
  nomeAluno: process.env.SJ_ALUNO ?? 'Pedro',

  simulado: {
    titulo: 'Simulado de prática — 5 questões',
    /** Minutos, ou null para sem limite. */
    tempoLimite: 20,
    /** Nota máxima total, dividida igualmente entre as questões. */
    notaMaxima: 10,
  },

  /**
   * As 5 questões. Cada uma vira uma Questao (origem "PROFESSOR", já entra
   * aprovada — só questão gerada por IA nasce PENDENTE) + suas Alternativas.
   * Edite à vontade; mantenha exatamente uma alternativa com `correta: true`.
   */
  questoes: [
    {
      enunciado: 'Qual é a capital do Brasil?',
      alternativas: [
        { texto: 'Brasília', correta: true },
        { texto: 'Rio de Janeiro', correta: false },
        { texto: 'São Paulo', correta: false },
        { texto: 'Salvador', correta: false },
      ],
    },
    {
      enunciado: 'Quanto é 7 × 8?',
      alternativas: [
        { texto: '54', correta: false },
        { texto: '56', correta: true },
        { texto: '58', correta: false },
        { texto: '64', correta: false },
      ],
    },
    {
      enunciado: 'Qual planeta é conhecido como o "Planeta Vermelho"?',
      alternativas: [
        { texto: 'Vênus', correta: false },
        { texto: 'Júpiter', correta: false },
        { texto: 'Marte', correta: true },
        { texto: 'Saturno', correta: false },
      ],
    },
    {
      enunciado: 'Quem escreveu "Dom Casmurro"?',
      alternativas: [
        { texto: 'José de Alencar', correta: false },
        { texto: 'Machado de Assis', correta: true },
        { texto: 'Clarice Lispector', correta: false },
        { texto: 'Graciliano Ramos', correta: false },
      ],
    },
    {
      enunciado: 'Qual é o maior oceano do mundo?',
      alternativas: [
        { texto: 'Atlântico', correta: false },
        { texto: 'Índico', correta: false },
        { texto: 'Ártico', correta: false },
        { texto: 'Pacífico', correta: true },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// Cliente HTTP minimalista com sessão por cookie
// ---------------------------------------------------------------------------

let cookieSessao = null

async function chamar(metodo, caminho, corpo) {
  const resposta = await fetch(`${CONFIG.apiBaseUrl}${caminho}`, {
    method: metodo,
    headers: {
      Accept: 'application/json',
      ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(cookieSessao ? { Cookie: cookieSessao } : {}),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  })

  // Guarda o cookie de sessão devolvido no login pra reusar nas próximas chamadas.
  const setCookie = resposta.headers.get('set-cookie')
  if (setCookie) cookieSessao = setCookie.split(';')[0]

  const texto = await resposta.text()
  const dados = texto ? JSON.parse(texto) : null

  if (!resposta.ok) {
    const mensagem = dados?.mensagem ?? dados?.message ?? dados?.error ?? JSON.stringify(dados)
    throw new Error(`${metodo} ${caminho} → ${resposta.status}: ${mensagem}`)
  }

  return dados
}

const get = (caminho) => chamar('GET', caminho)
const post = (caminho, corpo) => chamar('POST', caminho, corpo ?? {})

// ---------------------------------------------------------------------------
// Passos
// ---------------------------------------------------------------------------

async function login() {
  console.log(`→ Entrando como "${CONFIG.login.username}"...`)
  const usuario = await post('/auth/login', CONFIG.login)
  console.log(`  ok — ${usuario.tipoUsuario} (${usuario.nomePessoa ?? usuario.username})`)
  return usuario
}

async function encontrarAluno(nomeBusca) {
  const alunos = await get('/alunos')
  const alvo = nomeBusca.trim().toLowerCase()
  const encontrados = alunos.filter((aluno) => aluno.pessoa?.nome?.toLowerCase().includes(alvo))

  if (encontrados.length === 0) {
    throw new Error(`Nenhum aluno encontrado com o nome "${nomeBusca}".`)
  }
  if (encontrados.length > 1) {
    const nomes = encontrados.map((a) => `  - ${a.pessoa.nome} (id ${a.id})`).join('\n')
    throw new Error(
      `Mais de um aluno bate com "${nomeBusca}"; ajuste SJ_ALUNO pro nome completo:\n${nomes}`,
    )
  }

  console.log(`→ Aluno: ${encontrados[0].pessoa.nome} (id ${encontrados[0].id})`)
  return encontrados[0]
}

async function encontrarTurmaAtiva(alunoId) {
  const historico = await get(`/aluno-turma/aluno/${alunoId}/historico`)
  const ativa = historico.find((matricula) => matricula.status === 'ATIVA')

  if (!ativa) {
    throw new Error(
      'Esse aluno não tem matrícula ATIVA em nenhuma turma — destinação "ESPECIFICO" exige uma turma.',
    )
  }

  console.log(`→ Turma ativa: ${ativa.turma.nome ?? `#${ativa.turma.id}`} (id ${ativa.turma.id})`)
  return ativa.turma
}

/**
 * Nenhum campo em /questoes salva a ligação — o back só aceita via um
 * recurso à parte, /questao-conteudo (descoberto por tentativa, já que a
 * API não documenta isso e o front ainda não usa: a tela do professor
 * cria questão sem "conteúdo" nenhum e bate no mesmo 409 que este script
 * bateu na primeira tentativa). Sem essa etapa, POST /simulado-questao
 * sempre devolve 409 "A questão precisa estar vinculada a um conteúdo".
 */
async function encontrarConteudos(turmaId) {
  const todos = await get('/conteudo-plano')
  const doTurma = todos.filter(
    (item) => item.planoEnsino?.turmaDisciplina?.turma?.id === turmaId,
  )

  if (doTurma.length === 0) {
    throw new Error(
      `Não há nenhum "conteúdo" cadastrado (Plano de Ensino) pra turma #${turmaId} — ` +
        'crie um em Professor → Plano de Ensino antes de gerar o simulado.',
    )
  }

  console.log(
    `→ Conteúdos disponíveis na turma: ${doTurma.map((c) => c.titulo).join(', ')}`,
  )
  return doTurma
}

async function criarSimulado(turmaId, disciplinaId, periodoLetivo) {
  console.log(`→ Criando simulado "${CONFIG.simulado.titulo}" (período ${periodoLetivo})...`)
  const simulado = await post('/simulados', {
    titulo: CONFIG.simulado.titulo,
    tipoDestinacao: 'ESPECIFICO',
    turmaId,
    disciplinaId,
    tempoLimite: CONFIG.simulado.tempoLimite ?? null,
    notaMaxima: CONFIG.simulado.notaMaxima ?? null,
    quantidadeQuestoes: CONFIG.questoes.length,
    // Formato aceito pelo back: "2026" ou "2026/1" (ver utils/validacao.ts).
    // Precisa bater com o período do Plano de Ensino pra Nota recalcular certo.
    periodoLetivo,
  })
  console.log(`  ok — simulado #${simulado.id} (RASCUNHO)`)
  return simulado
}

async function criarQuestoes(simuladoId, disciplinaId, conteudos) {
  const pontuacaoPorQuestao = CONFIG.simulado.notaMaxima
    ? Number((CONFIG.simulado.notaMaxima / CONFIG.questoes.length).toFixed(2))
    : undefined

  for (const [indice, questao] of CONFIG.questoes.entries()) {
    console.log(`→ Questão ${indice + 1}/${CONFIG.questoes.length}: "${questao.enunciado}"`)

    const questaoSalva = await post('/questoes', {
      enunciado: questao.enunciado,
      tipo: 'ALTERNATIVAS',
      disciplinaId,
      nivelDificuldade: 'MEDIA',
      origem: 'PROFESSOR',
    })

    for (const [posicao, alternativa] of questao.alternativas.entries()) {
      await post('/alternativas', {
        questaoId: questaoSalva.id,
        texto: alternativa.texto,
        correta: alternativa.correta,
        ordem: posicao + 1,
      })
    }

    // Revezando entre os conteúdos disponíveis, só pra não prender as 5
    // questões todas no mesmo tópico quando há mais de um cadastrado.
    const conteudo = conteudos[indice % conteudos.length]
    await post('/questao-conteudo', {
      questao: { id: questaoSalva.id },
      conteudoPlano: { id: conteudo.id },
    })

    await post('/simulado-questao', {
      simuladoId,
      questaoId: questaoSalva.id,
      ordem: indice + 1,
      pontuacao: pontuacaoPorQuestao,
    })
  }

  console.log(`  ok — ${CONFIG.questoes.length} questões criadas e vinculadas`)
}

async function lancarParaAluno(simuladoId, alunoId) {
  console.log('→ Lançando o simulado para o aluno...')
  await post(`/simulados/${simuladoId}/lancar`, { alunoIds: [alunoId] })
  console.log('  ok — o aluno já pode iniciar a tentativa')
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------

async function main() {
  await login()

  const aluno = await encontrarAluno(CONFIG.nomeAluno)
  const turma = await encontrarTurmaAtiva(aluno.id)
  const conteudos = await encontrarConteudos(turma.id)
  const disciplinaId = conteudos[0].planoEnsino?.turmaDisciplina?.disciplina?.id ?? null
  const periodoLetivo = conteudos[0].planoEnsino?.periodoLetivo ?? '2026'

  const simulado = await criarSimulado(turma.id, disciplinaId, periodoLetivo)
  await criarQuestoes(simulado.id, disciplinaId, conteudos)
  await lancarParaAluno(simulado.id, aluno.id)

  console.log('\n✔ Concluído.')
  console.log(`  Simulado #${simulado.id} — "${CONFIG.simulado.titulo}"`)
  console.log(`  ${CONFIG.questoes.length} questões · lançado para ${aluno.pessoa.nome}`)
}

main().catch((erro) => {
  console.error(`\n✘ ${erro.message}`)
  process.exitCode = 1
})
