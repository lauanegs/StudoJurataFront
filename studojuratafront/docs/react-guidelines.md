# React Guidelines — StudoJurataFront

React 19, TypeScript strict, Vite 7. Estas regras descrevem o que o projeto **já faz** e onde aplicar critério ao estender. Baseado nas [Rules of React](https://react.dev/reference/rules) e na documentação oficial — não trate nada aqui como otimização prematura recomendada por padrão.

## Componentes

- Componente de página: `export default function NomeDaPagina()`, um por arquivo, PascalCase igual ao arquivo (`Alunos.tsx` → `export default function Alunos()`).
- Componente de design system (`components/ui/X`): `export function X(props: XProps)` (named export, não default) — padrão consistente em toda `components/ui/`, para permitir import nomeado e melhor autocomplete/refactor.
- Um componente por arquivo. Sub-componentes usados só internamente (ex.: uma linha de tabela específica de uma tela) podem viver no mesmo arquivo da página que os usa, sem precisar de arquivo próprio — não crie um arquivo novo em `components/ui/` para algo que nunca vai ser reusado.

## Composição

- Componentes de `components/ui/` são pensados para composição via `children`/props de slot (`Header` recebe `actions`/`filtros` como `ReactNode`, `DataTable` recebe `actions` como função `(row) => ReactNode`) — seguir esse padrão em vez de props booleanas que ligam/desligam variações internas rígidas (`showActions?: boolean` seria mais rígido que aceitar `actions?: ReactNode`).
- Prefira compor componentes existentes (`Layout` + `Header` + `DataTable`) a criar um componente novo que reimplementa a composição por dentro.

## Props

- Tipadas em `types.ts` próprio do componente (`ButtonProps`, `CardProps`, etc.), nunca inline no componente para componentes de `components/ui/` — já é o padrão de todos os ~46 componentes.
- Props com valor padrão via desestruturação (`variant = 'primary'`, `size = 'medium'`, `loading = false`), não `defaultProps` (removido do React 19 para componentes de função de qualquer forma).
- `...rest` espalhado para o elemento nativo/Mantine subjacente quando faz sentido (`<MantineButton ... {...rest}>`) — permite que quem usa `<Button>` passe qualquer prop válida do Mantine sem o wrapper precisar declarar cada uma. Use com critério: só quando o wrapper realmente delega para um único componente de baixo nível, não quando isso vazaria detalhes de implementação incoerentes com a API pública do wrapper.
- **Props excessivas** (mais de ~8-10 props obrigatórias) são sinal de que o componente pode estar assumindo responsabilidade demais — mas `DataTable` legitimamente tem várias props (columns, data, rowKey, loading, error, onReload, paginacao, empty, actions) porque é o componente que concentra toda a lógica de exibição de tabela do projeto; não é um problema a corrigir só por contar props.

## Estado

- `useState` local é o padrão para estado de UI (campo de busca, modal aberto, aba ativa). Não promover estado para Context "por via das dúvidas" — os três contextos do projeto (`Auth`, `Toast`, `Confirm`) existem porque são genuinamente globais, não porque estado local seria "menos elegante".
- **Estado derivado não deve virar `useState` + `useEffect` sincronizando.** O projeto já segue isso: `filtrados` e `itensDaPagina` são `useMemo`, não `useState` atualizado por `useEffect` toda vez que `data`/`busca` mudam. Ao adicionar um valor que pode ser calculado a partir de outro estado/prop existente, calcule-o durante a renderização (direto ou via `useMemo`), não crie um estado novo para ele.
- **Estado duplicado**: não guardar em `useState` um valor que já existe em outro lugar (prop, outro estado, contexto) só para "ter uma cópia local" — isso cria a possibilidade de dessincronia. Exemplo do próprio projeto fazendo certo: `AuthContext` guarda `usuario` uma vez; páginas que precisam dele usam `useAuth()`, não copiam para estado próprio.
- Formulários: usar `useFormulario` (estado + validação + touched num único lugar) em vez de um `useState` por campo, **a não ser que o formulário seja trivial** (1-2 campos sem validação cruzada) — nesse caso `useState` direto é mais simples e não precisa do hook. Ver `docs/architecture.md` #1 para o caso onde isso não foi seguido (`SimuladoFormulario.tsx`, `TurmaFormulario.tsx`) — candidato a revisão, não a "correção automática".

## Hooks

- Hooks só chamados no topo do componente/hook, nunca condicionalmente — regra das Rules of React, sem exceção observada no projeto.
- Custom hooks (`use*`) para lógica com estado ou efeito reaproveitável (`useRequisicao`, `useDebounce`, `usePaginacao`...). **Não criar um custom hook para lógica que não tem estado nem efeito** — isso é só uma função, coloque em `utils/`.
- **Hook desnecessário**: antes de extrair um `useAlgo()` novo, verificar se ele seria chamado de um único lugar e não encapsula nada com estado/efeito genuinamente reaproveitável — nesse caso é indireção sem ganho. Os hooks existentes do projeto (`useHidratar`, `useAcao`) foram extraídos porque o mesmo padrão (`useEffect` com `ref` de controle) se repetia em várias telas antes de existirem.

## useEffect

O projeto já segue a orientação oficial de "[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)" na prática: dado derivado é `useMemo`, não efeito. Os `useEffect` reais do projeto são para sincronizar com sistemas externos, o caso legítimo de `useEffect`:
- buscar dados na montagem/mudança de dependência (`useRequisicao`, com guarda de corrida via `ref`);
- assinar um evento externo (`aoExpirarSessao` em `AuthContext`);
- debounce (`useDebounce`, com `setTimeout`/`clearTimeout`);
- sincronizar uma `ref` (`buscarRef.current = buscar`) para que um callback sempre veja a versão mais recente sem precisar entrar no array de dependências.

**Não adicionar um `useEffect` para:**
- calcular algo a partir de props/state já disponíveis (use `useMemo` ou calcule direto no corpo do componente);
- resetar um estado quando uma prop muda, se isso puder ser expresso via `key` no componente pai forçando remontagem;
- reagir a uma mudança de estado para disparar outra atualização de estado que poderia ter sido feita no mesmo handler que causou a primeira mudança.

Quando o array de dependências do `useEffect`/`useMemo`/`useCallback` for propositalmente incompleto (como em `useRequisicao`, `useFormulario`), o projeto já documenta com `// eslint-disable-next-line react-hooks/exhaustive-deps` **acompanhado de comentário explicando por quê** (ex.: "o array `dependencias` funciona como no useEffect, mas por design não queremos re-executar quando `erros` muda"). Seguir esse padrão — nunca desabilitar a regra sem explicar o motivo.

## useMemo

Usar para (a) derivar dado de uma lista/objeto sem recalcular a cada render desnecessariamente quando o cálculo é não-trivial (filtro de lista, fatiar página), ou (b) manter identidade referencial estável quando isso importa para um array de dependências downstream. **Não envolver todo cálculo em `useMemo` por padrão** — para uma expressão barata (`a + b`, um `.find()` numa lista pequena), o custo do `useMemo` (comparação de dependências, alocação do cache) não compensa. Otimização prematura não é boa prática aqui: só usar `useMemo` quando há um motivo concreto (lista que pode ser grande, ou necessidade de estabilidade referencial), não em todo `const x = ...` dentro de um componente.

## useCallback

Mesma lógica do `useMemo`: usar quando a função é passada como dependência de outro hook (`useEffect`, `useMemo`) ou como prop para um componente memoizado (`React.memo`) onde a re-criação causaria re-render/re-execução desnecessária — como em `useFormulario` (`definirCampo`, `campo`, `aoEnviar` são estáveis porque outros hooks/efeitos dependem deles). **Não envolver todo handler de evento em `useCallback` "por hábito"** — um `onClick` inline passado para um `<button>`/Mantine comum não precisa disso; o projeto não faz isso em `Alunos.tsx`, por exemplo (`onClick={() => navegar(...)}` é inline, sem `useCallback`).

## Custom hooks

Convenção do projeto: hook devolve um objeto nomeado (não array posicional, exceto quando espelha a API do próprio React como `useState`) — `{ data, loading, error, reload, setData, isEmpty }`, `{ pagina, totalPaginas, itensDaPagina, ... }`. Facilita destructuring seletivo e leitura no call site. Seguir esse padrão em qualquer hook novo.

## Eventos

- Handlers nomeados com prefixo `ao` (`aoEnviar`, `aoExpirarSessao`) para os que o projeto define, ou o nome padrão da prop (`onClick`, `onChange`, `onRowClick`) quando é a interface que um componente expõe para quem o usa. Não misturar os dois estilos na mesma API pública de um componente.
- `useFormulario().campo(nome)` já resolve `onChange`/`onBlur`/`value`/`erro` de forma consistente para inputs controlados — usar em vez de escrever os três handlers na mão para cada campo de um formulário que já usa o hook.

## Renderização

- Componentes de página são `lazy()`-carregados nas rotas (`routes/index.tsx`) com `<Suspense>` — o code-splitting já acontece no nível de rota; não é necessário (nem, provavelmente, vantajoso) fazer `lazy()` de componentes individuais dentro de uma página.
- Evitar criar componentes inline dentro do JSX de renderização de lista (uma função de componente definida dentro do corpo de outro componente é recriada a cada render, perdendo estado dos filhos entre renders) — não observado como problema no código atual, mas é uma armadilha a evitar ao escrever código novo.

## Listas e keys

- `key` sempre um id estável do domínio (`rowKey={(aluno) => aluno.id}` no `DataTable`, ou `key={item.id}` direto em `.map()`), nunca o índice do array quando a lista pode reordenar, filtrar ou ter itens removidos/inseridos no meio — que é o caso comum aqui (listagens com busca/filtro). Índice como `key` é aceitável só para listas estáticas que nunca reordenam nem filtram (raro neste projeto).

## Performance

- Sem `React.memo` em uso hoje em `components/ui/` — não introduzir preventivamente. Se um componente de lista específico apresentar re-render mensurável e custoso (não hipotético), tratar como uma otimização pontual e justificada, não como prática padrão de todo componente novo.
- `useDebounce` já resolve o caso comum de "não filtrar/buscar a cada tecla digitada" — reusar em vez de reimplementar debounce manual com `setTimeout` numa página.
- Paginação client-side (`usePaginacao`) evita renderizar uma tabela inteira de uma vez quando a lista é grande — já é a mitigação de performance de listagem do projeto, dado que o back não pagina.

## Acessibilidade

- Mantine já resolve boa parte de acessibilidade nos componentes que usa por baixo (foco, ARIA de modal/dialog, navegação por teclado) — ao delegar para Mantine, essa base vem de graça; ao escrever HTML customizado, replicar o mínimo: `label`/`htmlFor` associados (`Field` já faz isso), `role="alert"` em mensagens de erro (já usado em `Field`), `aria-hidden` em ícones puramente decorativos (`Asterisk` em `Field`).
- Ícones de ação sem texto visível (`IconButton`) precisam de `label` (prop já existe e é usada — `label={\`Excluir ${aluno.pessoa?.nome}\`}` em `Alunos.tsx`) para leitor de tela — manter esse padrão em todo uso de `IconButton`/botão só-ícone novo.

## Referências
- [React — Rules of React](https://react.dev/reference/rules)
- [React — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React — Thinking in React](https://react.dev/learn/thinking-in-react)
- [React — Referência de Hooks](https://react.dev/reference/react)
