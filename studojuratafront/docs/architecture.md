# Arquitetura — StudoJurataFront

> Descreve a arquitetura **real** deste front-end, levantada por inspeção direta do código-fonte em 2026-08-10 — não uma arquitetura ideal. Complementa [`docs/architecture.md` do StudoJurataApi](../../StudoJurataApi/docs/architecture.md) (backend, repositório irmão).

## 1. Visão geral

SPA em **React 19 + TypeScript 5.9 (strict) + Vite 7**, roteada com **react-router-dom 7**. Consome a API REST do `StudoJurataApi` via sessão de cookie (não há token/JWT no cliente). UI construída sobre **Mantine 9** (`@mantine/core`, `@mantine/hooks`, `@mantine/dates`), com uma camada própria de componentes (`components/ui/`) por cima — e um resquício real de **`styled-components` 6**, ainda em uso em parte do código enquanto uma migração para Mantine está em andamento (ver seção 4). Sem biblioteca de gerenciamento de estado global (Redux/Zustand/Jotai) — estado é local (`useState`) ou em Context API para as poucas necessidades verdadeiramente globais (autenticação, toast, confirmação). Sem React Query/SWR — busca de dados é feita por hooks próprios sobre `fetch` nativo.

## 2. Estrutura de pastas e responsabilidades

```
src/
├── components/
│   ├── ui/            — ~46 componentes de design system (Button, Input, Card, DataTable, ...)
│   ├── layout/         — Layout (casca da página) + Sidebar (menus por perfil)
│   ├── <domínio>/      — graficos, simulados, desempenho, gamificacao, planejamento, pessoas, eventos
│   └── feedback/        — ConfirmDialog, Toast, EstadoVazio, ErroCarregamento, Skeleton
├── pages/
│   ├── adm/             — telas do Administrador (CRUD de Alunos, Turmas, Cursos, ...)
│   ├── professor/       — telas do Professor (Plano de Ensino, Plano de Aula, Reforço/Simulados, Notas)
│   ├── aluno/            — telas do Aluno (Home, Simulado, Notas, Perfil, Reforço)
│   └── auth/             — Login, NaoAutorizado, NaoEncontrada
├── routes/               — definição de rotas (lazy-loaded) + guarda de rota por perfil
├── services/             — api.ts (cliente HTTP) + um arquivo por domínio
├── contexts/             — AuthContext, ToastContext, ConfirmContext
├── formularios/         — hooks de formulário (@mantine/form + schemas yup) por domínio
├── hooks/                — useRequisicao, useAcao, usePaginacao, useDebounce, useHidratar, useAuth, useEscola, usePerfilLogado
├── types/                — um arquivo por domínio + comum.ts
├── utils/                — formatação, labels, aniversariantes, ícones, cor, skins, exportacao/ (PDF, planilha, gráfico)
└── styles/               — theme.ts (tokens styled-components) + mantineTheme.ts (mesmos tokens para Mantine) + global.ts + styled.d.ts
```

### `components/ui/`
Design system próprio do projeto: um componente por "átomo" de interface (`Button`, `Input`, `Select`, `Card`, `Modal`, `DataTable`, `Tag`, `Chip`, `Toggle`, etc.), cada um em sua própria pasta com `ComponentName.tsx` + `types.ts` (+ `styles.ts` quando ainda usa styled-components) + `index.ts` de re-export. A maioria desses componentes **delega para o Mantine por baixo**, mantendo uma API própria estável — ver seção 4.

### `pages/`
Organizadas **por perfil de usuário** (`adm/professor/aluno/auth`), espelhando a segmentação de papéis do backend (`TipoUsuario`: `ADMINISTRADOR`, `PROFESSOR`, `ALUNO`). Dentro de cada perfil, subpastas por domínio (`Alunos/`, `Turmas/`, `Reforco/`...). Padrão de arquivo: uma página de listagem (`Alunos.tsx`) e uma de formulário (`AlunoFormulario.tsx`, cobrindo criar E editar no mesmo componente) por entidade — não há páginas de "detalhe" somente-leitura separadas na maioria dos casos.

### `routes/`
`routes/index.tsx` (541 linhas) declara todas as rotas com `lazy()` + `Suspense` — o tamanho do arquivo é majoritariamente a lista de `const X = lazy(() => import(...))`, não complexidade real. `RotaProtegida.tsx` é o guard de acesso por perfil, usado ao redor de cada `<Route>`. **Importante**: esse guard é proteção de UX (evitar mostrar/piscar uma tela errada), não o limite de segurança real — a autorização de fato é sempre imposta pelo backend (`SecurityConfig`); o front nunca deve tratar `RotaProtegida` como suficiente para proteger um dado sensível.

### `services/`
- `api.ts`: cliente HTTP próprio sobre `fetch` (sem axios), com `credentials: 'include'` (sessão por cookie), `ApiError` tipado com getters semânticos (`naoAutenticado`, `semPermissao`, `naoEncontrado`, `erroDeNegocio`), mapeamento centralizado de mensagens de erro em português, e um pub/sub simples (`aoExpirarSessao`) para notificar qualquer parte da aplicação quando uma resposta 401 chega — é assim que `AuthContext` derruba a sessão local sem precisar de um interceptor de biblioteca.
- `<domínio>.ts` (`autenticacao`, `pessoas`, `curriculo`, `turmas`, `planejamento`, `notas`, `eventos`, `simulados`, `gamificacao`, `ia`): uma função por rota real de um `@RestController` do back (`simulados.listar()`, `simulados.lancar(id, dados)`...) — nenhuma página monta URL na mão.

### `types/`
Um arquivo por domínio (mesmos nomes de `services/`) com os tipos espelhando os DTOs do backend; `comum.ts` guarda o que é compartilhado entre domínios.

### `hooks/`
A base de reuso de lógica do projeto (ver `docs/react-guidelines.md` para detalhes de cada um):
- `useRequisicao` — busca de dados com loading/erro/cancelamento de corrida (ignora resposta de uma requisição obsoleta se os parâmetros mudaram no meio do caminho) e `reload`/`setData` para updates otimistas.
- `useAcao` — estado de "executando" para uma mutação (salvar/excluir/aprovar), evita duplo clique.
- `usePaginacao` — pagina uma lista **no cliente**, porque o backend não pagina nenhuma listagem (ver `StudoJurataApi/docs/architecture.md` #2) — é uma decisão consciente, documentada no próprio hook.
- `useDebounce`, `useHidratar` (preenche formulário de edição uma única vez por objeto recebido, sem sobrescrever o que o usuário já digitou), `useAuth`, `useEscola`, `usePerfilLogado` (`useAlunoLogado`/`useProfessorLogado`/`useSkinEquipadaDoAluno` — ponte entre `pessoaId` do usuário logado e o id de domínio Aluno/Professor que a maioria das rotas do back exige).

### `formularios/`
Um hook por formulário (`useFormularioPessoa`, `useFormularioTurma`, `useFormularioSimulado`...), feito com `useForm` do `@mantine/form` e `schemaResolver` de um schema yup. A validação é assíncrona (`await form.validate()`). CPF, CEP e telefone são validados com `@brazilian-utils/brazilian-utils`, que também busca o endereço por CEP em `components/pessoas/PessoaCampos`. `DatePicker`/`TimePicker` recebem `value` + `form.setFieldValue` em vez de `getInputProps`.

### `contexts/`
Três contextos, cada um com um par `XContext.tsx` (provider) + `xContexto.ts` (o `createContext`/tipo, separado para reduzir re-render de quem só precisa do tipo) — `AuthContext` (usuário logado, cache em `localStorage`, fonte de verdade em `/auth/me`), `ToastContext`, `ConfirmContext` (substitui `window.confirm` por um modal consistente com o design system).

### `utils/`
`format.ts` (formatação de CPF, data, idade), `labels.ts` (rótulos de enum em português — ex. `ROTULO_TIPO_USUARIO`), `corComOpacidade.ts`, `redimensionarIcone.tsx`, `skins.ts` (gamificação).

## 3. Fluxo de dados (exemplo real: tela `Alunos`)

```
Alunos.tsx
  │
  ├─ useRequisicao(() => alunos.listar(), [])   — dispara GET /api/alunos ao montar
  │     └─ services/<domínio>.ts → services/api.ts → fetch (cookie de sessão)
  │
  ├─ useDebounce(busca) + useMemo               — filtro client-side por nome/CPF/matrícula
  ├─ usePaginacao(filtrados)                    — paginação client-side (back não pagina)
  │
  └─ <Layout><Header/><DataTable columns=... data=... /></Layout>
        └─ ação de excluir: useConfirm() (modal) → alunos.excluir(id) → toast → reload()
```

Esse é o fluxo padrão de uma tela de listagem: hook de requisição → filtro/paginação locais → composição de componentes `ui/` dentro de `Layout`. Telas de formulário seguem um fluxo parecido, adicionando `@mantine/form` + schema yup (hooks em `formularios/`) (ou, em alguns casos maiores, estado manual — ver seção 5, problema #1) e `useHidratar` para popular o formulário quando editando um registro existente.

## 4. Estilização — estado real (migração em andamento)

O projeto está **no meio de uma migração de `styled-components` para Mantine**, e isso é intencional e documentado no próprio código (`src/styles/mantineTheme.ts`: *"Os dois convivem enquanto os componentes são migrados um a um; nada muda visualmente para quem olha o app."*). Estado medido nesta análise:

- **20 de 46** componentes em `components/ui/` ainda importam `styled-components` diretamente (arquivo `styles.ts` próprio ou `styled()` inline no `index.tsx`).
- **26 de 46** já delegam para Mantine, mantendo a mesma API pública de props que o resto do app já usa — ex.: `Button` (`components/ui/Button/Button.tsx`) recebe `variant`/`size`/`icon`/`loading`/`fullWidth` como sempre recebeu, mas por dentro renderiza `<MantineButton>`. Essa é a estratégia de migração do projeto: **trocar a implementação sem obrigar a mudança de nenhuma tela que já usa o componente**.
- **29 arquivos de página** ainda importam `styled-components` diretamente para ajustes de layout específicos da tela (fora do design system).
- Dois arquivos de tokens de tema coexistem por design: `styles/theme.ts` (tokens para styled-components) e `styles/mantineTheme.ts` (os mesmos tokens, convertidos para o formato de tema do Mantine — cores em tupla de 10 tons, espaçamento, raio, sombra, tamanho de fonte). `main.tsx` monta os dois providers ao mesmo tempo (`<MantineProvider>` por fora, `<ThemeProvider>` do styled-components por dentro).

**Implicação para revisão/refatoração:** não é um erro corrigir "de uma vez" — é um projeto em transição deliberada. Ao revisar um componente que ainda usa `styled-components`, avaliar se migrá-lo para Mantine é apropriado *nesse momento* (ver `docs/mantine-guidelines.md`), mas isso é uma decisão a tratar por componente, não uma tarefa a espalhar silenciosamente por todo o código numa mudança não relacionada.

## 5. Problemas arquiteturais identificados

Registrados para orientar revisões futuras — **não devem ser corrigidos automaticamente** sem avaliação caso a caso.

1. ~~Componentes de formulário muito grandes.~~ **Resolvido:** `SimuladoFormulario` e `TurmaFormulario` ficam cada um em sua pasta, divididos em cartão de configuração/dados, modais e abas.
2. **Migração `styled-components` → Mantine incompleta** (seção 4). Não é, por si, um "bug", mas gera dois jeitos de estilizar coexistindo — uma revisão precisa saber distinguir "componente ainda não migrado" de "componente com CSS desnecessário que o Mantine já resolveria".
3. ~~`types/index.ts` e `services/endpoints.ts` num único arquivo.~~ **Resolvido:** divididos por domínio.
4. **Sem nenhum teste automatizado.** Nenhum arquivo `.test.ts(x)`/`.spec.ts(x)` no projeto, e nenhuma dependência de teste (`vitest`, `@testing-library/react`, etc.) no `package.json`. Qualquer refatoração precisa ser verificada manualmente no navegador (ver skill/processo `run` do projeto) e reportada como tal.
5. **Validação duplicada manualmente entre front e back.** Os schemas yup em `formularios/` reimplementam regras que também existem como Bean Validation no backend (ex.: formato de `periodoLetivo`). Não há geração automática nem contrato compartilhado — um campo que muda de regra no back não avisa o front. Não é um problema a "resolver" nesta etapa (exigiria uma decisão de arquitetura maior, tipo geração de tipos a partir do OpenAPI), mas é bom estar ciente ao mexer em qualquer validação espelhada.
6. ~~Barrel file `components/ui/index.ts` sem uso consistente.~~ **Resolvido:** nenhum arquivo importava os barrels `components/ui/index.ts` e `components/feedback/index.ts`, que foram removidos. O padrão é importar pelo caminho específico (`'.../components/ui/Button'`).
7. ~~Logs de execução do Vite na raiz do repositório.~~ **Resolvido:** removidos.
8. **`dist/` presente no diretório de trabalho.** É build output; confirmar que está no `.gitignore` (está) e que não foi commitado por engano antes de qualquer limpeza.
9. **Agregações de desempenho calculadas no cliente.** `pages/professor/Reforco/Desempenho.tsx` e `useDesempenhoDados.ts` baixam todos os simulados e tentativas e agregam no navegador (inclusive o recorte "turmas do professor"), porque não há endpoint agregado no back. Funciona com o volume atual, mas é regra/recorte que pertence ao backend — candidato a endpoint próprio, como já foi feito com a carga horária e as faltas por turma (`GET /turmas/{id}/frequencia-alunos`).
10. **i18n inexistente.** Textos de UI escritos direto nas telas, em português. Decisão: não adotar i18n por enquanto.

## 6. Onde colocar cada tipo de lógica (regra para páginas/componentes novos)

- **Chamada de API** → sempre via `services/<domínio>.ts`, nunca `fetch`/URL montada na mão dentro de um componente.
- **Estado de carregamento/erro de uma busca** → `useRequisicao`, não `useState` + `useEffect` manual reimplementando o mesmo controle de corrida/cancelamento.
- **Estado de "salvando"/"excluindo"** → `useAcao`.
- **Estado e validação de formulário** → hook em `formularios/<domínio>.ts` (`@mantine/form` + yup), a não ser que o formulário seja trivial o bastante (1-2 campos) para não justificar o hook.
- **Formatação/validação reaproveitável** → `utils/` (`format.ts`, `labels.ts`) e `formularios/` (schemas yup), nunca duplicada inline em múltiplas páginas.
- **Peça de UI reaproveitável** (usada ou clara candidata a ser usada em mais de uma tela) → `components/ui/`, delegando para Mantine quando o Mantine já resolve (ver `docs/mantine-guidelines.md`).
- **Espaçamento e grade de layout** → `Stack` (`components/ui/Stack`, reexporta o do Mantine) para colunas com `gap` e `GradeAutoAjuste` para grades `auto-fit`, em vez de um `styled.div` novo por tela.
- **Peça de UI específica de uma única tela, sem reuso claro** → pode viver dentro do próprio arquivo da página como componente local, ou em `styled-components` pontual se for só um ajuste de layout — não precisa virar componente em `components/ui/` "por precaução".
- **Estado verdadeiramente global** (usuário logado, toast, confirmação) → Context API, como já é feito — não introduzir uma lib de state management para isso.

## 7. Dependências entre camadas (regra de sentido)

```
pages/     → components/ui, components/layout, hooks, services, contexts, types, utils
components/ui → (Mantine ou styled-components), types, utils — nunca importa de pages/
hooks/     → services, contexts, types — nunca importa de pages/ nem components/ui
services/  → types — não conhece React (sem hooks, sem JSX)
contexts/  → services, hooks, types
```

Nunca o inverso: `services/` e `utils/` não importam nada de `components/`, `pages/` ou `contexts/`; `components/ui/` não importa de `pages/`.
