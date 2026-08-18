# Clean Code — guia prático (StudoJurataFront)

> Nenhuma regra aqui é absoluta. O critério final é sempre: **a versão mais simples que preserva comportamento, legibilidade e testabilidade vence.** Exemplos usam código real do projeto.

## Nomes significativos

O projeto já é consistente: **vocabulário de domínio em português** (`Aluno`, `Simulado`, `lancar`, `resolverElegiveis`... — mesmo padrão do backend), nomes de hooks descrevendo o que devolvem (`useRequisicao`, `usePaginacao`, `useHidratar`), variáveis de estado nomeadas pelo que representam, não pelo tipo (`buscaAtrasada`, não `debouncedValue` genérico). Manter esse vocabulário — não misturar `handleClick`/`onSubmit` em inglês com o resto em português dentro do mesmo arquivo, quando o arquivo já estabeleceu um idioma.

- Booleans como pergunta: `ehAluno`, `montadoRef.current`, `temAnterior`. Evite `flag`, `check`, `data` genérico.
- Handlers de evento: `aoEnviar`, `onRowClick`, `onChange` — o projeto mistura o padrão `handleX`/`aoX` conforme o componente é próprio ou vem de uma prop de biblioteca; ao escrever um handler novo dentro de um componente do projeto, usar `ao` + verbo (`aoSalvar`, `aoFechar`), como a maioria já faz.

## Componentes pequenos (tamanho como sintoma, não meta)

`Alunos.tsx` (166 linhas: hook de busca, filtro, paginação, colunas, render) é o tamanho saudável de uma página de listagem neste projeto. `SimuladoFormulario.tsx` (820 linhas, 15+ `useState`) é o outro extremo — não porque "mais de X linhas é proibido", mas porque o componente genuinamente acumula responsabilidades que já têm solução própria no projeto (`useFormulario` para o estado do formulário, e possivelmente componentes locais para o editor de questões / modais). Ver `docs/react-guidelines.md` para o critério de quando extrair.

**Quando não extrair:** uma página de listagem com filtro + tabela (`Alunos.tsx`, `Turmas.tsx`, etc.) que já delega loading/erro/paginação para hooks não precisa ser fatiada em sub-componentes — ela já é enxuta porque a lógica pesada mora nos hooks, não porque foi fragmentada artificialmente.

## Responsabilidade única

Um hook, uma responsabilidade: `useRequisicao` só busca; `useAcao` só controla estado de mutação; `usePaginacao` só pagina; `useDebounce` só atrasa um valor. Nenhum faz duas coisas. Ao adicionar lógica nova a um componente, primeiro perguntar se ela já é responsabilidade de um hook existente antes de reimplementar inline (ver o antipadrão real do projeto: formulários grandes que não usam `useFormulario`, apesar de ele existir e ser usado em outros formulários).

## Redução de complexidade

- Guard clauses em vez de aninhamento: `if (!dados || jaAplicado.current === dados) return` (`useHidratar`), `if (!confirmado) return` (fluxo de exclusão em `Alunos.tsx`).
- Extrair condição composta para variável nomeada em vez de inline num JSX: `const ehAluno = usuario?.tipoUsuario === 'ALUNO'`, não repetir a comparação em três lugares do componente.
- `useMemo` para derivar dado a partir de estado (`filtrados`, `itensDaPagina`) em vez de recalcular dentro do JSX ou duplicar em `useState` + `useEffect` sincronizando (ver "estado desnecessário" em `docs/react-guidelines.md`).

## Eliminação de duplicação (DRY sem abstração artificial)

Duplicação real já resolvida no projeto: toda tela de listagem repete o padrão `useRequisicao` + `useDebounce` + `useMemo` de filtro + `usePaginacao` — **isso não deve virar um hook `useListagemCRUD()` genérico**. Cada listagem filtra por campos diferentes, tem colunas diferentes, ações diferentes; um hook genérico obrigaria a passar tanta configuração que ficaria mais complexo que as 4-5 linhas repetidas hoje. A duplicação aqui é de **estrutura**, não de **regra** — mantenha como está.

DRY vale para lógica que hoje já é código, não esqueleto: se uma mesma regra de formatação (ex. `formatarCpf`) fosse reimplementada em duas páginas em vez de importada de `utils/format.ts`, isso é duplicação real a eliminar.

## Código morto

Remover import não usado, componente não referenciado, prop que nenhum call-site passa mais. Confirmar com busca antes de remover — props de componentes de design system (`components/ui/`) podem ter poucos ou nenhum uso hoje mas fazer parte da API pública intencional do componente (ex.: uma variante de `Button` ainda não usada em nenhuma tela, mas parte do design system do Figma).

## Tratamento de exceções

O padrão do projeto é: hooks de dado (`useRequisicao`) capturam o erro e devolvem `error: string | null`; ações (`useAcao`, ou `try/catch` manual como em `Alunos.tsx.excluir()`) capturam `ApiError` especificamente e mostram um toast com a mensagem já traduzida por `services/api.ts`. Não usar `alert()`/`console.error` como tratamento de erro voltado ao usuário — sempre `useToast()`. Distinguir erro do usuário (mostrar mensagem) de erro inesperado (deixar propagar ou logar) usando `error instanceof ApiError`, como já é feito.

## Validações

Formato de campo → `utils/validacao.ts` (`Validador<T>`, composável via `combinar()`), plugado no `useFormulario`. Não reimplementar uma regex/checagem que já existe em `validacao.ts` dentro de uma página.

## Comentários

O projeto usa comentários para explicar **decisões não óbvias** — por que um `ref` existe (`useHidratar`, `useRequisicao`), por que uma migração está em andamento (`mantineTheme.ts`), por que um hook evita re-render desnecessário. Esse é o padrão a seguir: comentário explica o "porquê", nunca repete o "o quê" que o nome já diz. Não comentar `// busca os alunos` acima de `alunos.listar()`.

## Parâmetros

Hooks e funções do projeto raramente passam de 3 parâmetros; quando passam (`useRequisicao(buscar, dependencias, opcoes)`), o terceiro já é um objeto de opções nomeadas (`{ ativo }`), não mais parâmetros posicionais soltos — seguir esse padrão (objeto de opções a partir do 3º parâmetro) em vez de empilhar argumentos posicionais.

## Condicionais

Preferir comparação direta de enum/união de string (`usuario?.tipoUsuario === 'ALUNO'`) a `switch` quando é um único caso; usar `switch`/objeto de lookup (como `ROTULO_TIPO_USUARIO`) quando há 3+ ramos mapeando o mesmo valor para saídas diferentes — o projeto já usa esse padrão de objeto-lookup em vez de `if/else`/`switch` longo para tradução de enum → rótulo.

## Null / undefined

TypeScript `strict: true` está ativo — o compilador já força tratar `null`/`undefined` explicitamente. Seguir o padrão já usado: encadeamento opcional (`aluno.pessoa?.nome`) + fallback explícito (`?? '—'` ou `?? ''`) em vez de non-null assertion (`!`). O único `!` no projeto está em `main.tsx` (`document.getElementById('root')!`), aceitável porque é a raiz do DOM garantida pelo `index.html` do próprio projeto — não é um padrão a replicar em código de aplicação.

## Optional/undefined em vez de `null` sentinela duplo

Onde o projeto usa `T | null` para "ainda não carregou/não existe" (`RequestState<T>.data`), é consistente e não deve virar `T | undefined` só por preferência — mudar o sentinela de ausência é uma decisão de tipo que se propaga por todo consumidor do hook.

## Listas e iteração

`.map()`/`.filter()`/`.find()` diretos para transformar arrays de dados de API — o padrão do projeto (`filtrados`, `opcoesDisciplinas`, etc.). Ver `docs/react-guidelines.md` para a regra de `key` em listas renderizadas.

## Legibilidade

Um componente de página deve se ler de cima para baixo como: hooks de dado → hooks derivados (filtro/paginação) → handlers → JSX. É o padrão em `Alunos.tsx` e na maioria das páginas de listagem — usar como referência ao revisar/escrever uma página nova.

## Testabilidade

Não há testes automatizados hoje (ver `docs/architecture.md` #4). Isso não isenta o código de ser escrito de forma testável: hooks que não dependem de módulo global mutável, componentes que recebem dados via props em vez de acessar contexto direto quando não precisam do contexto inteiro, funções puras em `utils/` sem efeito colateral — tudo isso já é seguido e deve continuar sendo, mesmo sem um `describe()` cobrando.

## Referências
- Robert C. Martin, *Clean Code* — síntese de nomes, funções, comentários.
- [React — Thinking in React](https://react.dev/learn/thinking-in-react) e [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).
