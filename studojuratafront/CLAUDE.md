# CLAUDE.md — StudoJurataFront

Documento principal de instruções para trabalhar neste repositório. Reflete a arquitetura e os padrões **reais** do código, levantados por inspeção direta (não uma arquitetura idealizada). Documentos detalhados complementares em `docs/`:

- [`docs/architecture.md`](docs/architecture.md) — arquitetura real, estrutura de pastas, fluxo de dados, problemas identificados.
- [`docs/figma-fidelity.md`](docs/figma-fidelity.md) — **fidelidade visual ao protótipo do Figma (fonte de verdade da UI) — ler antes de qualquer alteração visual.**
- [`docs/clean-code.md`](docs/clean-code.md) — guia prático de Clean Code adaptado ao projeto.
- [`docs/react-guidelines.md`](docs/react-guidelines.md) — regras de React.
- [`docs/typescript-guidelines.md`](docs/typescript-guidelines.md) — regras de TypeScript.
- [`docs/mantine-guidelines.md`](docs/mantine-guidelines.md) — regras de Mantine.
- [`docs/code-review.md`](docs/code-review.md) — checklist de revisão.
- [`docs/refactoring-guidelines.md`](docs/refactoring-guidelines.md) — processo de refatoração passo a passo.

## Fidelidade ao Figma — regra fundamental de UI

**O protótipo do Figma é a fonte de verdade da interface visual deste projeto:** https://www.figma.com/design/vWqFpdxs0jHWtNMQn1Q6W4/StudoJurata?node-id=0-1&m=dev

Antes de qualquer alteração visual significativa (layout, espaçamento, cor, tipografia, dimensão, borda, sombra, componente, estado, responsividade), consultar o Figma e preservar o que ele define — inclusive durante refatorações "só de código", que não podem gerar mudança visual acidental. O Mantine é a ferramenta para *reproduzir* o Figma, nunca uma justificativa para se afastar dele. Nenhuma implementação é considerada concluída sem atender às três dimensões: **funcionalidade, código e fidelidade visual**. Regra completa, processo passo a passo e critérios de aceitação em [`docs/figma-fidelity.md`](docs/figma-fidelity.md) — esta seção é um resumo, não um substituto.

Backend irmão: `../StudoJurataApi` (ver o `CLAUDE.md`/`docs/` dele para a API consumida por este front).

## Stack

- **React 19** + **TypeScript ~5.9.3** (`strict: true`) + **Vite 7**
- **react-router-dom 7** — rotas `lazy()`-carregadas, guard de acesso por perfil (`RotaProtegida`)
- **Mantine 9** (`@mantine/core`, `@mantine/hooks`, `@mantine/dates`) — biblioteca de UI principal, tema próprio em `styles/mantineTheme.ts`
- **styled-components 6** — ainda em uso parcial; o projeto está em **migração ativa para Mantine** (ver seção "Estilização" abaixo)
- **dayjs** (locale `pt-br`) para datas
- **lucide-react** para ícones
- Sem axios — cliente HTTP próprio sobre `fetch` (`services/api.ts`)
- Sem Redux/Zustand/Jotai/React Query/SWR — estado local + Context API + hooks próprios de busca de dados
- Sem framework de teste configurado (`vitest`/`jest`) e **zero arquivos de teste** hoje
- ESLint (`js` recommended + `typescript-eslint` recommended + `react-hooks` flat recommended + `react-refresh` vite) — sem Prettier configurado

## Arquitetura atual

Camadas: `pages/` (por perfil: `adm/professor/aluno/auth`) → compõe `components/ui/` + `components/layout/` → usa `hooks/` (busca/estado) → que usam `services/` (chamada HTTP tipada) → tipado por `types/`. Estado verdadeiramente global só em `contexts/` (Auth, Toast, Confirm). Ver [`docs/architecture.md`](docs/architecture.md) para o detalhamento completo, incluindo os "Problemas arquiteturais identificados" — **não corrigir esses problemas silenciosamente**; existem para orientar decisões futuras que exigem confirmação do usuário.

## Estrutura de pastas
```
src/
├── components/ui/       — ~46 componentes de design system (a maioria envolve Mantine)
├── components/layout/    — Layout (casca da página)
├── components/Sidebar/   — navegação lateral
├── components/feedback/   — Toast, ConfirmDialog, EstadoVazio, ErroCarregamento, Skeleton
├── pages/{adm,professor,aluno,auth}/ — telas por perfil de usuário
├── routes/                — rotas lazy + guard de perfil
├── services/               — api.ts (cliente HTTP) + endpoints.ts (1 função por rota do back)
├── contexts/                — AuthContext, ToastContext, ConfirmContext
├── hooks/                     — useRequisicao, useAcao, useFormulario, usePaginacao, useDebounce, useHidratar, usePerfilLogado, useAuth, useEscola
├── types/index.ts               — tipos espelhando os DTOs do back
├── utils/                         — validacao.ts, format.ts, labels.ts, corComOpacidade.ts, redimensionarIcone.tsx, skins.ts
└── styles/                          — theme.ts (styled-components) + mantineTheme.ts (mesmos tokens p/ Mantine) + global.ts
```

## Padrões utilizados

- **Design system próprio sobre Mantine**: componentes de `components/ui/` mantêm uma API estável (props em português/domínio) e delegam a implementação para Mantine por baixo — troca de biblioteca não obriga a mudar telas consumidoras. Ver `docs/mantine-guidelines.md`.
- **Hooks como unidade de reuso de lógica**, não HOCs nem render props: `useRequisicao` (busca com cancelamento de corrida), `useAcao` (estado de mutação), `useFormulario` (estado/validação/touched de formulário), `usePaginacao` (paginação client-side, porque o backend não pagina nenhuma listagem).
- **Camada de serviço tipada**: `services/endpoints.ts` é o único lugar que conhece as rotas HTTP reais; páginas nunca montam URL/`fetch` diretamente.
- **Autenticação por sessão de cookie**, cache local em `localStorage` só para evitar flash de tela (fonte de verdade é sempre `/auth/me`), com pub/sub próprio (`aoExpirarSessao`) para reagir a 401 de qualquer lugar da aplicação sem lib de interceptor.
- **Páginas por perfil**, espelhando os papéis do backend (`ADMINISTRADOR`/`PROFESSOR`/`ALUNO`) — guard de rota no front é proteção de UX, a autorização real é sempre imposta pelo backend.

## Regra fundamental: simplicidade acima de tudo

**O objetivo não é escrever o máximo de código abstrato — é escrever o código mais simples que resolve corretamente o problema.** Evitar:
- abstrações desnecessárias (hook novo para lógica sem estado/efeito reaproveitável, generic para tipo que nunca varia);
- componentes desnecessários (fragmentar um componente legível só para reduzir contagem de linhas);
- hooks desnecessários;
- funções excessivamente fragmentadas;
- prop drilling desnecessário (ou, ao contrário, Context para algo que só um componente usa);
- estados duplicados (cópia local de algo que já está em prop/contexto/outro hook);
- `useEffect` desnecessário (o que `useMemo`/cálculo direto já resolveria);
- tipos artificiais (interface que só existe para "parecer tipado", sem narrowing/segurança real);
- wrappers sem benefício (componente que envolve Mantine sem adaptar nada);
- CSS quando o Mantine já resolve (`Stack`/`Group`/`Grid`, tokens de tema);
- componentes próprios quando o Mantine já oferece solução adequada (Button, Input, Select, Modal, Drawer, Card, Paper, Table, Tabs, Notification...).

O padrão de wrapper fino sobre Mantine (`components/ui/Button` etc.) **não** é uma exceção a essa regra — é composição de design system justificada (API estável, delega implementação), diferente de recriar um `Button` do zero.

**Esta regra é sobre código, não sobre design.** Simplificar é sempre bem-vindo na forma como um resultado visual é implementado — nunca no resultado visual em si. Um elemento do Figma (espaçamento assimétrico, sombra composta, degradê específico) não deve ser simplificado ou removido só porque uma versão de código mais simples existiria; ver [`docs/figma-fidelity.md`](docs/figma-fidelity.md).

## Regras de Clean Code
Ver [`docs/clean-code.md`](docs/clean-code.md). Resumo: nomes de domínio em português consistentes com o resto do código; componente/hook com uma responsabilidade clara; duplicação de *estrutura* (padrão listagem: busca+filtro+paginação) é aceita, duplicação de *regra* (validação/formatação reimplementada) não é; comentários explicam o porquê, nunca repetem o nome; sem `try/catch` silencioso — erro sempre vira toast ou `error` de hook.

## Regras de React
Ver [`docs/react-guidelines.md`](docs/react-guidelines.md). Resumo: estado derivado é `useMemo`/cálculo direto, nunca `useState`+`useEffect` sincronizando; `useEffect` só para sistemas externos (busca, assinatura de evento, debounce), nunca para calcular algo já disponível; `useMemo`/`useCallback` só quando há custo real ou necessidade de estabilidade referencial — não por hábito; `key` de lista sempre um id estável, nunca índice em lista que reordena/filtra; formulário com mais de 2-3 campos usa `useFormulario`.

## Regras de TypeScript
Ver [`docs/typescript-guidelines.md`](docs/typescript-guidelines.md). Resumo: `any` só com justificativa comentada (padrão: 1 caso em todo o projeto); `import type` para importações só de tipo (`verbatimModuleSyntax` exige); enum do backend vira union de string literal no front, não `enum` do TS; tipo de domínio definido uma vez em `types/index.ts`, nunca duplicado; anotar tipo só quando a inferência não seria suficiente ou é assinatura pública.

## Regras de Mantine
Ver [`docs/mantine-guidelines.md`](docs/mantine-guidelines.md). Resumo: verificar sempre se o Mantine já resolve antes de criar/CSS customizar; seguir o padrão de wrapper fino já estabelecido em `components/ui/`; páginas importam de `components/ui/`, não de `@mantine/core` diretamente; migração styled-components → Mantine é decisão por componente, não obrigação automática em toda mudança; **usar Mantine nunca justifica um resultado visual diferente do Figma — personalizar o componente até bater, não o contrário.**

## Processo de revisão
Ver [`docs/code-review.md`](docs/code-review.md) — checklist cobrindo componentes grandes, responsabilidades, duplicação, props excessivas, estado desnecessário, `useEffect`, hooks, `any`/casts, tipos duplicados, CSS, Mantine, **fidelidade ao Figma**, acessibilidade, responsividade, performance, imports, código morto, possíveis bugs e regressões.

## Processo de refatoração
Ver [`docs/refactoring-guidelines.md`](docs/refactoring-guidelines.md): entender → identificar comportamento atual → identificar problemas → classificar por gravidade → planejar a menor mudança → aplicar → `tsc -b --noEmit` + `npm run lint` (+ `npm run build` quando a mudança for ampla) → verificar regressão manualmente no navegador (sem testes automatizados) → revisar de novo → simplificar se necessário.

## Preservação de comportamento

Ao refatorar ou revisar código existente:
- **Preservar comportamento, layout e responsividade.**
- **Preservar fidelidade ao Figma** — se a tela batia com o protótipo antes, continua batendo depois; refatoração "só de código" não é desculpa para mudança visual acidental (ver [`docs/figma-fidelity.md`](docs/figma-fidelity.md)).
- **Preservar contratos de API** — `types/index.ts`/`services/endpoints.ts` continuam batendo com o backend real; front e back são repositórios separados, um campo renomeado sem coordenação quebra em silêncio.
- **Preservar regras de negócio** (validação, formatação, permissão de tela).
- **Não remover funcionalidade existente.**
- **Não substituir uma solução funcional apenas por preferência pessoal** (trocar `useState` por `useFormulario`, ou styled-components por Mantine, sem que isso resolva um problema real identificado) — e não substituir/simplificar um elemento visual do Figma apenas porque uma implementação mais simples existe.

**Quando uma alteração puder mudar comportamento, layout, aparência visual ou contrato observável, sinalizar antes de realizá-la e esperar confirmação** — não é opcional, mesmo dentro de uma tarefa de "só Clean Code". Nenhuma tarefa está concluída sem atender às três dimensões: funcionalidade, código e fidelidade visual ao Figma.

## Referências gerais
Ver a seção "Referências" ao final de cada documento em `docs/` (React, TypeScript, Mantine, Vite, ESLint — documentação oficial como base, sem cópia de trechos extensos).
