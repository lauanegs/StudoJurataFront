# TypeScript Guidelines — StudoJurataFront

TypeScript ~5.9.3, `strict: true` (mais `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, `verbatimModuleSyntax` — ver `tsconfig.app.json`). A regra geral: **usar TypeScript para aumentar segurança e clareza, não para criar complexidade artificial.**

## Evitar `any`

O projeto já pratica isso quase à risca: **um único `any` real em todo o código-fonte** (`Typography.tsx:102`, `component={(as ?? DEFAULT_TAG[variant]) as any}`), e ele vem com `eslint-disable-next-line` **e um comentário explicando por quê** (limitação de tipagem do prop `component` polimórfico do Mantine). Esse é o padrão a seguir: `any` só quando não há alternativa tipável razoável, sempre isolado, sempre com uma linha de justificativa — nunca como atalho para "resolver o erro do compilador rápido".

Preferir, nesta ordem, antes de recorrer a `any`:
1. Tipo específico já existente (`types/index.ts`, `types.ts` do componente).
2. `unknown` + narrowing, quando o tipo realmente não é conhecido de antemão (é o que `ApiError.corpo: unknown` faz).
3. Generic (`<T>`), quando o mesmo código precisa funcionar para vários tipos de forma tipada (`useRequisicao<T>`, `useFormulario<T>`).
4. Union type explícito, quando o valor é um de um conjunto finito conhecido.

## Tipagem de props

Toda prop de componente em `components/ui/` é tipada em um `types.ts` próprio (`ButtonProps`, `FieldProps`, `DataTableProps<T>`...), nunca inline no `.tsx`. Seguir esse padrão para componente novo: criar `types.ts` ao lado do componente, exportar a interface, importar no `.tsx` com `import type`.

`import type` (não `import`) para importações usadas só como tipo — obrigatório aqui porque `verbatimModuleSyntax: true` está ativo no `tsconfig.app.json`; sem `import type`, o build falha ou gera import desnecessário em runtime.

## Tipos de API

`types/index.ts` espelha os DTOs do backend (`Simulado`, `SimuladoRequest`, `SimuladoResponse`, etc.) — o padrão Request/Response do backend (`docs/spring-boot-guidelines.md` do `StudoJurataApi`) se reflete aqui: tipos de entrada (`XRequest`) e saída (`XResponse`) separados quando o backend também os separa, porque os campos nem sempre coincidem (ex.: campo controlado só pelo servidor, como `status`). Ao adicionar um tipo novo para uma rota nova, seguir a nomenclatura e a forma já usada pelos tipos vizinhos no mesmo arquivo, e conferir contra o DTO real do backend (`StudoJurataApi/src/main/java/studojurata_api/dto/`) em vez de adivinhar a forma da resposta.

## Unions

Enums do backend (`@Enumerated(EnumType.STRING)`) viram **union de string literal** no front (`type TipoDestinacaoSimulado = 'TODOS' | 'ESPECIFICO'`), não `enum` do TypeScript — é o padrão observado em todo `types/index.ts`. Vantagem já aproveitada pelo projeto: combina bem com objetos de lookup (`ROTULO_TIPO_USUARIO: Record<TipoUsuario, string>`) para tradução/rótulo, e o compilador cobra exaustividade em `switch`/lookup sem precisar de um valor `default` frágil.

## Generics

Usados onde genuinamente há reuso por tipo variável: `useRequisicao<T>`, `useAcao<Args, Retorno>`, `useFormulario<T>`, `DataTable<T>` (`Coluna<T>`, `rowKey: (item: T) => ...`). **Não introduzir um generic para um componente/hook que só é (e só vai ser) usado com um tipo concreto** — isso é abstração sem benefício, adiciona uma letra `<T>` que ninguém instancia de forma diferente.

## Interfaces vs. types

O projeto usa `interface` para formas de objeto que representam props/estado/DTOs (`ButtonProps`, `RequestState<T>`, `Aluno`), e `type` para unions, aliases de função e tipos utilitários (`type Validador<T> = ...`, `type TipoDestinacaoSimulado = 'TODOS' | 'ESPECIFICO'`). Seguir essa divisão — não é uma regra absoluta do TypeScript, mas é a convenção já estabelecida no código e a mais comum na comunidade React/TS (interface para "formas que podem crescer/ser estendidas", type para "aliases e uniões").

## Narrowing

`instanceof` para distinguir `ApiError` de outro erro (`error instanceof ApiError`), optional chaining + nullish coalescing para navegar objeto potencialmente incompleto (`aluno.pessoa?.nome ?? '—'`), `typeof` para argumento de forma variável (`typeof evento === 'string' ? evento : evento.target.value` em `useFormulario`). Preferir narrowing nativo do TypeScript (esses três) a type guards customizados (`function isX(v): v is X`) **a não ser que a checagem seja complexa o bastante para justificar nomear e reusar** — nenhum type guard customizado existe no projeto hoje porque nenhum caso precisou disso ainda.

## Null / undefined

`strict: true` já obriga tratar os dois. Padrão do projeto: `T | null` para "buscado, mas não existe / ainda não carregado" (estado de hooks de dados), `T | undefined` para "prop opcional não passada" (props de componente). Não misturar os dois sentidos no mesmo tipo sem necessidade — `data: T | null` em `useRequisicao` é claro porque distingue de `T | undefined` (que sugeriria "prop não passada", um conceito diferente de "ainda carregando").

## Evitar casts desnecessários

Um `as` só é aceitável quando o TypeScript genuinamente não consegue inferir algo que você sabe ser verdade (ex.: `(updater as (a: T | null) => T | null)(previous.data)` em `useRequisicao.setData`, necessário porque a união `T | ((previous: T | null) => T | null)` não teria como ser distinguida de outra forma sem um `typeof updater === 'function'` redundante ali). Não usar `as` para silenciar um erro de tipo que na verdade indica um bug (tipo errado sendo passado) — nesse caso, corrigir o tipo de origem, não converter à força no ponto de uso.

## Evitar duplicação de tipos

Um tipo de domínio (`Aluno`, `Simulado`) é definido **uma vez** em `types/index.ts` e importado onde precisar — não redeclarar um subconjunto de campos inline num componente ("`type AlunoResumo = { nome: string; cpf: string }`" replicando parte de `Aluno`) quando o tipo completo já existe e pode ser usado (ou `Pick<Aluno, 'nome' | 'cpf'>` se genuinamente só um subconjunto é relevante e vale a pena nomear).

## Inferência quando melhora a simplicidade

Não anotar tipo de retorno de função nem tipo de variável quando a inferência já produz o tipo certo e óbvio (`const [busca, setBusca] = useState('')` infere `string`, não precisa de `useState<string>('')`). Anotar explicitamente quando:
- a inferência ficaria mais ampla do que o desejado (`useState<TipoDestinacaoSimulado>('TODOS')` — sem a anotação, infere só `string`, perdendo a união);
- o valor inicial é `null`/vazio e o tipo real só aparece depois (`useState<LoginResponse | null>(...)`, `useState<Aluno[]>([])` — quando o array vazio não teria como inferir o tipo do elemento);
- é a assinatura pública de uma função exportada de `utils/`/`services/` — aí anotar o retorno é documentação, não redundância.

## Referências
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript — tsconfig `strict`](https://www.typescriptlang.org/tsconfig#strict)
- [React + TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/) — síntese de convenções da comunidade, não copiada literalmente.
