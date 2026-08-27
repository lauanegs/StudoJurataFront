# Pendências pedagógicas — revisão de lógica com o StudoJurataApi

Levantado a partir de uma revisão da lógica pedagógica real da escola (matrícula
cíclica, substituição de professores, cobrança de carga horária). Todos os 5
itens abaixo já estão implementados em front e backend.

## 1. Aula não pode ser criada fora do Plano de Aula — ✅ resolvido (front-only)

[RegistrarAulaTurma.tsx](../src/pages/professor/Turmas/RegistrarAulaTurma.tsx) criava
uma `Aula` avulsa quando não achava nenhuma pendente no plano. Removido: a tela
agora bloqueia o registro e direciona para cadastrar a aula no Plano de Aula
primeiro. Nenhuma mudança de contrato necessária.

## 2. Vínculo professor↔disciplina↔turma — titular + substitutos — ✅ implementado

**Decisão:** `TurmaDisciplina` continua 1 registro por turma+disciplina (professor
titular). Substituições viram um relacionamento novo, para que dois professores
possam registrar aula na mesma disciplina/turma **sem duplicar** Plano de Ensino
e Plano de Aula (que continuam únicos, vinculados ao `TurmaDisciplina`).

### Backend (StudoJurataApi)

- Nova entidade `TurmaDisciplinaSubstituto` (`turmaDisciplina`, `professor`,
  `status`) — soft-delete, mesmo padrão de `TurmaDisciplina`.
- Endpoints novos: `GET/POST /turma-disciplina/{turmaDisciplinaId}/substitutos`,
  `DELETE /turma-disciplina-substituto/{id}` (rotas já liberadas no
  `SecurityConfig` junto com o restante da gestão pedagógica).
- `ProfessorService.turmasLecionadas` passou a somar os vínculos onde o
  professor é titular **e** onde é substituto — usado por
  `PlanoAulaFormulario`, `PlanoEnsinoFormulario` e `RegistrarAulaTurma` no
  front, então esses dois papéis já compartilham automaticamente o mesmo
  Plano de Ensino/Plano de Aula.
- Validações: não permite o titular como seu próprio substituto, nem duplicar
  o mesmo professor como substituto duas vezes.

### Front (studojuratafront)

- Novo tipo `TurmaDisciplinaSubstituto` em `types/index.ts` e serviço
  `turmaDisciplinaSubstitutos` em `services/endpoints.ts`.
- Aba "Disciplinas e professores" em
  [TurmaFormulario.tsx](../src/pages/adm/Turmas/TurmaFormulario.tsx): botão
  "Gerenciar substitutos" por linha, abrindo um modal para vincular/remover
  professores substitutos daquele vínculo turma+disciplina.
- `RegistrarAulaTurma.tsx`, `PlanoAulaFormulario.tsx`,
  `PlanoEnsinoFormulario.tsx`: nenhuma mudança necessária — já consomem
  `turmasLecionadas`, que agora inclui os vínculos como substituto.

## 3. Notas por disciplina, 100 pontos, sem reset por período letivo — ✅ implementado

**Decisão confirmada:** cada disciplina distribui **100 pontos entre seus
simulados** (soma de `SimuladoAluno.nota`, cada um já na escala 0-`notaMaxima`
do seu simulado), acumulados **da data de matrícula do aluno na turma até o
fim do curso** — não reseta por "período letivo" calendário, porque a
matrícula é cíclica. Simulados com `notaMaxima = 0` são só repetição
espaçada/reforço, não entram na soma.

### Backend (StudoJurataApi)

- `Nota.periodoLetivo` (String, disambiguador antigo) foi substituído por
  `Nota.turma` (`Turma`, `optional = true` no Java só por causa de
  `ddl-auto=update` numa tabela já populada — ver comentário no Javadoc de
  `Nota.java`; exigido de fato em `NotaService`). **Precisa rodar
  manualmente antes de subir**: o `ALTER TABLE` (drop da constraint/coluna
  antigas, add de `turma_id`) documentado nesse mesmo comentário.
- `NotaService.recalcular(alunoId, disciplinaId, turmaId)`: agora **soma**
  (antes fazia média) os `SimuladoAluno.nota` concluídos, filtrando
  `notaMaxima > 0` e só os simulados aplicados a partir da
  `AlunoTurma.dataInicio` do aluno naquela turma (sem matrícula encontrada,
  mantém o comportamento permissivo anterior em vez de zerar a nota).
- `SimuladoAlunoService.finalizar` passou a disparar o recálculo por
  `simulado.getTurma()` em vez de `simulado.getPeriodoLetivo()` — simulados
  `ESPECIFICO` sem turma continuam com o recálculo pulado e registrado em
  `AuditLog` (mesmo padrão de antes).
- `POST /notas/recalcular` passa a receber `turmaId` em vez de `periodoLetivo`.
- `Simulado.periodoLetivo` **não foi removido** (segue existindo/obrigatório
  para simulados novos) — é usado só como metadado do simulado, não mais
  como chave de cálculo da nota.

### Front (studojuratafront)

- `types/index.ts`: `Nota.turma: Turma` no lugar de `periodoLetivo: string`.
- Removido o `PeriodoLetivoContext`/`PeriodoLetivoProvider` (filtro global de
  período que só existia para escopar Notas e disparava recálculo em massa ao
  trocar — não fazia mais sentido com matrícula cíclica).
- [professor/Notas/Notas.tsx](../src/pages/professor/Notas/Notas.tsx): cada
  linha do acordeão carrega sua própria `turmaId` (a tela já filtra por turma)
  e casa a nota por `aluno+disciplina+turma`.
- [aluno/Notas.tsx](../src/pages/aluno/Notas.tsx): nota exibida como `X/100`;
  título do acordeão passou a incluir a turma (`Disciplina · Turma`) para não
  confundir duas notas da mesma disciplina em turmas diferentes (repetência).

## 4. Turma sobrevive ao fim do Plano de Ensino/Plano de Aula — ✅ resolvido (front-only)

Decisão: encerrar (`status: INATIVO`) preserva histórico; um novo Plano de
Ensino/Plano de Aula é criado do zero, vinculado à mesma `TurmaDisciplina`.
Isso já era suportado pelo contrato existente — faltava só a ação explícita na
UI, adicionada em
[PlanosEnsino.tsx](../src/pages/professor/PlanoEnsino/PlanosEnsino.tsx) e
[PlanosAula.tsx](../src/pages/professor/PlanoAula/PlanosAula.tsx) (botão
"Encerrar" + coluna "Situação").

**Risco residual (para o back avaliar):** nada impede hoje duas linhas
`ATIVO` simultâneas de Plano de Aula para a mesma `TurmaDisciplina` — o front
pega a primeira (`data[0]`) arbitrariamente (ver comentário em
[RegistrarAulaTurma.tsx:155](../src/pages/professor/Turmas/RegistrarAulaTurma.tsx:155)).
Se possível, o back deveria garantir unicidade do `ATIVO` por
`turmaDisciplina`, ou expor de forma explícita "o ativo atual" ao invés do
front inferir por ordem de retorno.

## 5. Acompanhamento de conteúdo já ministrado — ✅ resolvido (front-only)

Não precisou de mudança de contrato: o vínculo `AulaConteudo` (aula ↔
conteúdo do plano) já existe, e uma aula ministrada já tem `dataPublicacao`
preenchida. Em
[ConteudosPlano.tsx](../src/pages/professor/PlanoEnsino/ConteudosPlano.tsx),
cada conteúdo mostra:
- "Pendente" se nunca foi vinculado a uma aula já ministrada;
- "Ministrado em {data}" se foi ministrado em uma única aula;
- "Ministrado em N aulas · última em {data}" quando o mesmo conteúdo foi
  retomado em mais de uma aula (reforço, conteúdo extenso dividido em mais de
  um encontro) — todas as datas ficam disponíveis no tooltip.

O cabeçalho mostra o progresso geral `X/Y conteúdos já ministrados`,
considerando todos os planos de aula que já existiram para aquele plano de
ensino, não só o ativo.

## Antes de subir para produção/homologação

1. Rodar o `ALTER TABLE` manual descrito no Javadoc de `Nota.java` (drop de
   `periodo_letivo`, add de `turma_id`) — `ddl-auto=update` não faz essa
   transformação sozinho.
2. Rodar `POST /notas/recalcular?alunoId=..&disciplinaId=..&turmaId=..` para
   toda `Nota` histórica que ficar sem `turma` depois do `ALTER TABLE`, para
   repovoar o histórico no novo formato (ou aceitar perder o histórico
   anterior à mudança, se for só ambiente de dev/demo).
3. Conferir manualmente no Swagger/API: criar um substituto, registrar aula
   como substituto, finalizar um simulado e conferir que `Nota.total` soma
   corretamente (sem teste automatizado configurado no backend, ver
   `docs/refactoring-guidelines.md` do StudoJurataApi).
