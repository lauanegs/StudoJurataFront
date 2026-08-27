#!/usr/bin/env node
/**
 * Popula o banco (já resetado pelo DevDataResetSeeder, profile "seed") com
 * dados coerentes pras telas citadas no PIBIC (módulo de reforço do
 * professor com alerta crítico, listagem de simulados por status/turma,
 * aprovação de questão gerada por IA, página inicial do aluno com
 * desempenho por disciplina, resolução de simulado, resultado final,
 * perfil com conquistas/skins).
 *
 * Uso: node scripts/seed-print-demo.mjs
 * Requer o back rodando com o profile "seed" já aplicado (ver LEIA-ME_seed.md).
 */

const CONFIG = {
  apiBaseUrl: process.env.SJ_API_URL ?? 'http://localhost:8080',
  professor: { username: 'joao.silva', senha: 'senha123' },
  periodoLetivo: '2026/1',
}

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

async function login() {
  console.log(`→ Entrando como "${CONFIG.professor.username}"...`)
  const usuario = await post('/auth/login', CONFIG.professor)
  console.log(`  ok — ${usuario.tipoUsuario} (${usuario.nomePessoa})`)
}

async function localizarBase() {
  const [turmas, disciplinas, alunos, conteudos] = await Promise.all([
    get('/turmas'),
    get('/disciplinas'),
    get('/alunos'),
    get('/conteudo-plano'),
  ])

  const turmaA = turmas.find((t) => t.titulo.includes('Turma A'))
  const turmaB = turmas.find((t) => t.titulo.includes('Turma B'))
  const matematica = disciplinas.find((d) => d.titulo === 'Matemática')
  const portugues = disciplinas.find((d) => d.titulo === 'Português')
  const pedro = alunos.find((a) => a.pessoa.nome.includes('Pedro'))
  const beatriz = alunos.find((a) => a.pessoa.nome.includes('Beatriz'))

  const conteudosDe = (turmaId, disciplinaId) =>
    conteudos
      .filter(
        (c) =>
          c.planoEnsino?.turmaDisciplina?.turma?.id === turmaId &&
          c.planoEnsino?.turmaDisciplina?.disciplina?.id === disciplinaId,
      )
      .sort((a, b) => a.ordem - b.ordem)

  console.log(`→ Turma A #${turmaA.id} · Turma B #${turmaB.id}`)
  console.log(`→ Matemática #${matematica.id} · Português #${portugues.id}`)
  console.log(`→ Pedro #${pedro.id} · Beatriz #${beatriz.id}`)

  return {
    turmaA,
    turmaB,
    matematica,
    portugues,
    pedro,
    beatriz,
    conteudosMatA: conteudosDe(turmaA.id, matematica.id),
    conteudosPorA: conteudosDe(turmaA.id, portugues.id),
  }
}

/**
 * Cria um simulado + suas questões (com alternativas) e devolve o simulado
 * junto com o mapa de questões (incluindo qual alternativa é a correta),
 * pra depois montar as respostas do aluno.
 */
async function criarSimuladoComQuestoes({ titulo, turmaId, disciplinaId, conteudos, questoes }) {
  console.log(`→ Criando simulado "${titulo}"...`)
  const simulado = await post('/simulados', {
    titulo,
    tipoDestinacao: 'ESPECIFICO',
    turmaId,
    disciplinaId,
    tempoLimite: 20,
    notaMaxima: 10,
    quantidadeQuestoes: questoes.length,
    periodoLetivo: CONFIG.periodoLetivo,
  })

  const pontuacaoPorQuestao = Number((10 / questoes.length).toFixed(2))
  const questoesCriadas = []

  for (const [indice, questao] of questoes.entries()) {
    const questaoSalva = await post('/questoes', {
      enunciado: questao.enunciado,
      tipo: questao.tipo ?? 'ALTERNATIVAS',
      disciplinaId,
      nivelDificuldade: questao.nivel ?? 'MEDIA',
      origem: 'PROFESSOR',
    })

    const alternativas = []
    for (const [posicao, alt] of questao.alternativas.entries()) {
      const salva = await post('/alternativas', {
        questaoId: questaoSalva.id,
        texto: alt.texto,
        correta: alt.correta,
        ordem: posicao + 1,
      })
      alternativas.push(salva)
    }

    const conteudo = conteudos[indice % conteudos.length]
    await post('/questao-conteudo', {
      questao: { id: questaoSalva.id },
      conteudoPlano: { id: conteudo.id },
    })

    await post('/simulado-questao', {
      simuladoId: simulado.id,
      questaoId: questaoSalva.id,
      ordem: indice + 1,
      pontuacao: pontuacaoPorQuestao,
    })

    questoesCriadas.push({ id: questaoSalva.id, alternativas })
  }

  console.log(`  ok — simulado #${simulado.id} com ${questoes.length} questões`)
  return { simulado, questoes: questoesCriadas }
}

async function lancarEFinalizar({ simulado, questoes }, alunoId, quantidadeAcertos) {
  await post(`/simulados/${simulado.id}/lancar`, { alunoIds: [alunoId] })

  const [simuladoAluno] = await get(`/simulado-aluno/simulado/${simulado.id}`).then((lista) =>
    lista.filter((sa) => sa.alunoId === alunoId),
  )

  const respostas = questoes.map((questao, indice) => {
    const acerta = indice < quantidadeAcertos
    const alternativa = acerta
      ? questao.alternativas.find((a) => a.correta)
      : questao.alternativas.find((a) => !a.correta)
    return {
      questaoId: questao.id,
      alternativaId: alternativa.id,
      tempoResposta: 25 + indice * 10,
    }
  })

  await post(`/simulado-aluno/${simuladoAluno.id}/finalizar`, {
    respostas,
    tempoGastoTotal: respostas.reduce((soma, r) => soma + r.tempoResposta, 0),
    finalizadoPorTempo: false,
  })

  console.log(
    `  ok — lançado e finalizado (${quantidadeAcertos}/${questoes.length} acertos, aluno #${alunoId})`,
  )
}

async function criarSimuladoRascunho({ titulo, turmaId, disciplinaId }) {
  console.log(`→ Criando simulado rascunho "${titulo}" (não lançado)...`)
  const simulado = await post('/simulados', {
    titulo,
    tipoDestinacao: 'TODOS',
    turmaId,
    disciplinaId,
    tempoLimite: 30,
    notaMaxima: 10,
    quantidadeQuestoes: 5,
    periodoLetivo: CONFIG.periodoLetivo,
  })
  console.log(`  ok — simulado #${simulado.id} (RASCUNHO)`)
}

async function criarQuestaoIAPendente(disciplinaId) {
  console.log('→ Criando questão gerada por IA (pendente de aprovação)...')
  const questao = await post('/questoes', {
    enunciado:
      'Uma função do 1º grau f(x) = ax + b passa pelos pontos (0, 3) e (2, 7). Qual é o valor de a?',
    tipo: 'ALTERNATIVAS',
    disciplinaId,
    nivelDificuldade: 'MEDIA',
    origem: 'IA',
  })

  const alternativas = [
    { texto: '1', correta: false },
    { texto: '2', correta: true },
    { texto: '3', correta: false },
    { texto: '4', correta: false },
  ]
  for (const [posicao, alt] of alternativas.entries()) {
    await post('/alternativas', {
      questaoId: questao.id,
      texto: alt.texto,
      correta: alt.correta,
      ordem: posicao + 1,
    })
  }
  console.log(`  ok — questão #${questao.id} (PENDENTE, origem IA)`)
}

async function main() {
  await login()
  const base = await localizarBase()

  // 1) Simulado de Matemática com desempenho baixo (< 50%) — dispara o
  //    alerta de desempenho crítico no Módulo de Reforço do professor.
  const simuladoMatBaixo = await criarSimuladoComQuestoes({
    titulo: 'Simulado de Reforço — Funções e Geometria',
    turmaId: base.turmaA.id,
    disciplinaId: base.matematica.id,
    conteudos: base.conteudosMatA,
    questoes: [
      {
        enunciado: 'Qual é o valor de f(2) para f(x) = 3x - 1?',
        alternativas: [
          { texto: '5', correta: true },
          { texto: '6', correta: false },
          { texto: '7', correta: false },
          { texto: '4', correta: false },
        ],
      },
      {
        enunciado: 'A soma dos ângulos internos de um triângulo é:',
        alternativas: [
          { texto: '90°', correta: false },
          { texto: '180°', correta: true },
          { texto: '270°', correta: false },
          { texto: '360°', correta: false },
        ],
      },
      {
        enunciado: 'Qual é a raiz da função f(x) = 2x - 8?',
        alternativas: [
          { texto: '2', correta: false },
          { texto: '3', correta: false },
          { texto: '4', correta: true },
          { texto: '8', correta: false },
        ],
      },
      {
        enunciado: 'A área de um quadrado de lado 5 cm é:',
        alternativas: [
          { texto: '10 cm²', correta: false },
          { texto: '20 cm²', correta: false },
          { texto: '25 cm²', correta: true },
          { texto: '30 cm²', correta: false },
        ],
      },
    ],
  })
  await lancarEFinalizar(simuladoMatBaixo, base.pedro.id, 1) // 1/4 = 25%

  // 2) Simulado de Português com desempenho alto — contraste no gráfico de
  //    desempenho por disciplina da página inicial do aluno.
  const simuladoPorAlto = await criarSimuladoComQuestoes({
    titulo: 'Simulado ENEM — Interpretação de Texto',
    turmaId: base.turmaA.id,
    disciplinaId: base.portugues.id,
    conteudos: base.conteudosPorA,
    questoes: [
      {
        enunciado: 'O termo "todavia" estabelece, no texto, uma relação de:',
        alternativas: [
          { texto: 'Causa', correta: false },
          { texto: 'Oposição', correta: true },
          { texto: 'Conclusão', correta: false },
          { texto: 'Adição', correta: false },
        ],
      },
      {
        enunciado: 'A ideia central de um parágrafo costuma estar expressa em:',
        alternativas: [
          { texto: 'Todas as frases igualmente', correta: false },
          { texto: 'Apenas no título', correta: false },
          { texto: 'Na frase-tópico', correta: true },
          { texto: 'Na última palavra', correta: false },
        ],
      },
      {
        enunciado: 'Um texto dissertativo-argumentativo tem como objetivo principal:',
        alternativas: [
          { texto: 'Narrar um fato', correta: false },
          { texto: 'Defender um ponto de vista', correta: true },
          { texto: 'Descrever uma cena', correta: false },
          { texto: 'Listar instruções', correta: false },
        ],
      },
      {
        enunciado: 'A concordância verbal está correta em:',
        alternativas: [
          { texto: '"Fazem dois anos que ele saiu"', correta: false },
          { texto: '"Faz dois anos que ele saiu"', correta: true },
          { texto: '"Fazem-se dois anos"', correta: false },
          { texto: '"Faziam dois anos"', correta: false },
        ],
      },
    ],
  })
  await lancarEFinalizar(simuladoPorAlto, base.pedro.id, 4) // 4/4 = 100%

  // 3) e 4) simulados curtos, pra dar volume de tentativas (conquistas do
  //    perfil) e mais pontos no gráfico ao longo do tempo.
  const simuladoMatMedio = await criarSimuladoComQuestoes({
    titulo: 'Revisão Rápida — Geometria Plana',
    turmaId: base.turmaA.id,
    disciplinaId: base.matematica.id,
    conteudos: base.conteudosMatA,
    questoes: [
      {
        enunciado: 'O perímetro de um retângulo de lados 4 cm e 6 cm é:',
        alternativas: [
          { texto: '10 cm', correta: false },
          { texto: '20 cm', correta: true },
          { texto: '24 cm', correta: false },
        ],
      },
      {
        enunciado: 'Um ângulo reto mede:',
        alternativas: [
          { texto: '45°', correta: false },
          { texto: '90°', correta: true },
          { texto: '180°', correta: false },
        ],
      },
      {
        enunciado: 'A área de um círculo de raio r é dada por:',
        alternativas: [
          { texto: '2πr', correta: false },
          { texto: 'πr²', correta: true },
          { texto: 'πr', correta: false },
        ],
      },
    ],
  })
  await lancarEFinalizar(simuladoMatMedio, base.pedro.id, 2) // 2/3 ≈ 67%

  const simuladoPorMedio = await criarSimuladoComQuestoes({
    titulo: 'Revisão Rápida — Gramática',
    turmaId: base.turmaA.id,
    disciplinaId: base.portugues.id,
    conteudos: base.conteudosPorA,
    questoes: [
      {
        enunciado: 'Assinale a alternativa com um substantivo coletivo:',
        alternativas: [
          { texto: 'Cardume', correta: true },
          { texto: 'Rápido', correta: false },
          { texto: 'Correr', correta: false },
        ],
      },
      {
        enunciado: 'O plural de "cidadão" é:',
        alternativas: [
          { texto: 'Cidadãos', correta: true },
          { texto: 'Cidadões', correta: false },
          { texto: 'Cidadães', correta: false },
        ],
      },
      {
        enunciado: 'Em "Ele chegou atrasado", a palavra destacada é:',
        alternativas: [
          { texto: 'Advérbio', correta: true },
          { texto: 'Adjetivo', correta: false },
          { texto: 'Substantivo', correta: false },
        ],
      },
    ],
  })
  await lancarEFinalizar(simuladoPorMedio, base.pedro.id, 3) // 3/3 = 100%

  // 5) e 6) simulados-diagnóstico bem curtos (2 questões), última rodada.
  const simuladoMatDiag = await criarSimuladoComQuestoes({
    titulo: 'Diagnóstico — Funções',
    turmaId: base.turmaA.id,
    disciplinaId: base.matematica.id,
    conteudos: base.conteudosMatA,
    questoes: [
      {
        enunciado: 'Se f(x) = x², então f(3) é:',
        alternativas: [
          { texto: '6', correta: false },
          { texto: '9', correta: true },
        ],
      },
      {
        enunciado: 'Uma função é crescente quando, ao aumentar x, f(x):',
        alternativas: [
          { texto: 'Também aumenta', correta: true },
          { texto: 'Diminui', correta: false },
        ],
      },
    ],
  })
  await lancarEFinalizar(simuladoMatDiag, base.pedro.id, 1) // 1/2 = 50%

  const simuladoPorDiag = await criarSimuladoComQuestoes({
    titulo: 'Diagnóstico — Interpretação',
    turmaId: base.turmaA.id,
    disciplinaId: base.portugues.id,
    conteudos: base.conteudosPorA,
    questoes: [
      {
        enunciado: 'Um texto narrativo apresenta, tipicamente:',
        alternativas: [
          { texto: 'Enredo, personagens e tempo', correta: true },
          { texto: 'Apenas argumentos', correta: false },
        ],
      },
      {
        enunciado: 'A linguagem denotativa é aquela usada em sentido:',
        alternativas: [
          { texto: 'Literal', correta: true },
          { texto: 'Figurado', correta: false },
        ],
      },
    ],
  })
  await lancarEFinalizar(simuladoPorDiag, base.pedro.id, 2) // 2/2 = 100%

  // 7) simulado ainda em rascunho (turma B), pra dar variedade de status
  //    na listagem de simulados do professor.
  await criarSimuladoRascunho({
    titulo: 'Simulado 2 — Funções Avançadas',
    turmaId: base.turmaB.id,
    disciplinaId: base.matematica.id,
  })

  // 8) questão gerada por IA, pendente de aprovação — tela de aprovação.
  await criarQuestaoIAPendente(base.matematica.id)

  console.log('\n✔ Concluído. Dados coerentes prontos pras telas do PIBIC.')
  console.log('  Login professor: joao.silva / senha123')
  console.log('  Login aluno:     aluno.pedro / senha123')
}

main().catch((erro) => {
  console.error(`\n✘ ${erro.message}`)
  process.exitCode = 1
})
