# Checklist de Code Review — StudoJurataFront

> Checklist que a própria Claude aplica ao revisar código deste projeto. Cada item remete a `clean-code.md`, `react-guidelines.md`, `typescript-guidelines.md`, `mantine-guidelines.md` e `architecture.md`. Achado precisa apontar arquivo/linha e impacto concreto — não reportar observações genéricas sem localização.

## Componentes grandes
- [ ] Um componente novo/alterado passou a acumular múltiplas responsabilidades não relacionadas (dados de formulário + editor de sub-item + gestão de modal) num único arquivo, como já ocorre em `SimuladoFormulario.tsx`/`TurmaFormulario.tsx`?
- [ ] Um componente de página ficou grande porque genuinamente tem muita UI própria (aceitável, ex. formulário longo real) ou porque reimplementa algo que um hook/componente existente já resolveria?

## Responsabilidades
- [ ] Um componente de `components/ui/` está fazendo chamada de API diretamente (deveria estar em `pages/` orquestrando, com o dado vindo via prop)?
- [ ] Uma página está montando URL/`fetch` na mão em vez de usar `services/endpoints.ts`?
- [ ] Lógica de formatação/validação foi escrita inline numa página em vez de estar (ou ir para) `utils/`?

## Duplicação
- [ ] A mesma regra de formatação/validação está reimplementada em mais de um arquivo em vez de importada de `utils/`?
- [ ] Um padrão de busca+filtro+paginação foi reimplementado manualmente em vez de `useRequisicao`/`useDebounce`/`usePaginacao`?
- [ ] Um tipo foi redeclarado (mesmo que parcialmente) em vez de reusar/`Pick` de um tipo já existente em `types/index.ts`?

## Props excessivas
- [ ] Um componente novo tem props demais para o que faz, sinalizando que deveria ser dividido — ou (caso contrário) as props fazem sentido porque o componente concentra deliberadamente um comportamento (como `DataTable`)?
- [ ] Uma prop booleana rígida foi adicionada onde uma prop de slot (`ReactNode`/render function) seria mais composável, na linha do que `Header`/`DataTable` já fazem?

## Estado desnecessário
- [ ] Existe um `useState` guardando um valor que poderia ser derivado via `useMemo` ou calculado direto no corpo do componente?
- [ ] Existe estado duplicado (uma cópia local de algo que já está em prop/contexto/outro estado)?
- [ ] Um formulário novo com mais de 2-3 campos evita `useFormulario` sem justificativa?

## useEffect
- [ ] Um `useEffect` novo calcula algo a partir de state/props já disponíveis, quando `useMemo` ou cálculo direto resolveria?
- [ ] Um `useEffect` novo sincroniza dois estados que poderiam ter sido atualizados juntos no mesmo handler?
- [ ] Um array de dependências foi silenciado (`eslint-disable ... exhaustive-deps`) sem comentário explicando o motivo?
- [ ] Falta cleanup (`return () => ...`) num efeito que assina evento/timer/subscription?

## Hooks
- [ ] Um hook é chamado condicionalmente ou depois de um `return` antecipado?
- [ ] Um custom hook novo foi criado para algo sem estado/efeito (deveria ser função em `utils/`)?
- [ ] Um custom hook existente (`useRequisicao`, `useAcao`, `useFormulario`, `usePaginacao`, `useDebounce`, `useHidratar`) foi reimplementado manualmente em vez de reusado?

## `any` / casts
- [ ] Foi introduzido `any` sem comentário explicando por que não há alternativa tipável (padrão do único caso aceito, `Typography.tsx`)?
- [ ] Foi introduzido um `as X` que na verdade mascara um tipo incompatível (bug em potencial) em vez de expressar uma conversão legítima?
- [ ] `unknown` + narrowing seria mais seguro que o cast usado?

## Tipos duplicados
- [ ] Um tipo de domínio novo diverge, sem necessidade, de um tipo já existente para a mesma entidade (`Aluno`, `Simulado`, etc.) em `types/index.ts`?
- [ ] O tipo novo confere com a forma real do DTO do backend correspondente (`StudoJurataApi/src/main/java/studojurata_api/dto/`), ou foi adivinhado?

## CSS
- [ ] Foi escrito CSS/`styled-components` novo para algo que uma prop do Mantine (`Stack`/`Group`/`Grid` gap, `color`, `variant`, tokens do tema) já resolveria (ver `docs/mantine-guidelines.md`)?
- [ ] Um valor de cor/espaçamento/raio foi hardcoded em vez de usar o token do tema (`theme.ts`/`mantineTheme.ts`)?

## Mantine
- [ ] Foi criado um componente próprio equivalente a um componente Mantine já disponível (Button, Input, Select, Modal, Drawer, Card, Paper, Stack, Group, Flex, Grid, Container, Table, Tabs, Notification)?
- [ ] Um componente de `components/ui/` foi migrado para Mantine mudando comportamento/aparência observável sem sinalizar isso como mudança funcional?
- [ ] Uma página importou `@mantine/core` diretamente em vez de usar o wrapper correspondente em `components/ui/` (quando ele existe)?

## Fidelidade ao Figma
Ver `docs/figma-fidelity.md` para a regra completa — o Figma é a fonte de verdade visual do projeto.
- [ ] Alguma alteração visual significativa (layout, espaçamento, cor, tipografia, dimensão, sombra, borda, `border-radius`, estado de componente) foi feita **sem** conferir o nó correspondente no [Figma](https://www.figma.com/design/vWqFpdxs0jHWtNMQn1Q6W4/StudoJurata?node-id=0-1&m=dev)?
- [ ] Uma divergência entre a implementação e o Figma foi resolvida a favor da implementação existente ou de uma preferência pessoal, em vez de a favor do Figma?
- [ ] Um elemento visual do protótipo (espaçamento assimétrico, sombra composta, degradê específico) foi simplificado/removido só porque uma versão mais simples de código existia — em vez de simplificar a implementação preservando o resultado visual?
- [ ] Uma mudança de comportamento responsivo foi feita assumindo `width: 100%`/empilhamento vertical como "responsivo correto" sem checar se o Figma tem uma versão específica de breakpoint para aquele elemento?
- [ ] Uma tarefa focada em uma parte da tela alterou, sem necessidade, elementos visuais de outra parte que não fazia parte do pedido?
- [ ] Uma refatoração puramente técnica (extrair hook, migrar para Mantine, dividir componente) mudou aparência/espaçamento/posicionamento sem essa mudança ter sido reconferida contra o Figma?

## Acessibilidade
- [ ] Um botão/ícone sem texto visível não tem `label`/`aria-label`?
- [ ] Um campo de formulário novo não associa `label` ao input (`htmlFor`/`id`, como `Field` já faz)?
- [ ] Uma mensagem de erro nova não usa `role="alert"` (padrão já em `Field`)?

## Responsividade
- [ ] Um layout novo usa `px`/largura fixa onde o resto do projeto usa unidades relativas/props responsivas do Mantine?
- [ ] Uma tabela/coluna nova não considera o padrão já existente de ocultar coluna em tela pequena (`ocultarEmTelaPequena` em `Coluna<T>`, usado em `Alunos.tsx`)?
- [ ] O comportamento responsivo implementado bate com a versão do Figma para aquele breakpoint (quando existe), ou com a intenção visual do design (quando não existe uma versão específica)?

## Performance
- [ ] Um `useMemo`/`useCallback` foi adicionado sem necessidade real (expressão barata, sem consumidor que dependa de estabilidade referencial) — otimização prematura?
- [ ] Ao contrário: falta `useMemo` num cálculo genuinamente caro (filtro/ordenação de lista grande) rodando a cada render?
- [ ] Um componente foi recriado inline dentro do corpo de outro componente (perde estado dos filhos a cada render do pai)?

## Imports
- [ ] `import type` usado para importações só de tipo (obrigatório com `verbatimModuleSyntax`)?
- [ ] Import não utilizado (pego por `noUnusedLocals`, mas confirmar antes de assumir que o lint pega tudo em código gerado/condicional)?
- [ ] Import inconsistente com o padrão dominante do projeto (caminho específico de `components/ui/X`, não o barrel `components/ui/index.ts`, salvo se o restante do arquivo já usa o barrel)?

## Código morto
- [ ] Prop, variável, função ou arquivo sem nenhuma referência (confirmado via busca, não só "parece não usado" — props de design system podem ser API pública intencional ainda não consumida)?
- [ ] Bloco de código comentado (não explicação) deixado no arquivo?

## Possíveis bugs
- [ ] `key` de lista usando índice do array numa lista que pode reordenar/filtrar?
- [ ] Comparação de union/string literal usando lógica que não cobre todos os valores possíveis (sem `default`/fallback num lookup)?
- [ ] Estado assíncrono (`useRequisicao`/`useAcao`) atualizado depois do componente desmontar, sem a guarda de `montadoRef` que os hooks existentes já usam?
- [ ] `null`/`undefined` acessado sem optional chaining onde o TypeScript permitiu por erro de tipagem em vez de por garantia real de que o valor existe?

## Possíveis regressões
- [ ] A mudança altera o formato de dado esperado de `services/endpoints.ts`/`types/index.ts` de um jeito que não bate mais com o backend real (`StudoJurataApi`)?
- [ ] A mudança altera layout/comportamento visual de um componente de `components/ui/` usado em várias telas, sem confirmar visualmente em todas (ou ao menos sinalizar o risco)?
- [ ] A mudança altera uma regra de validação (`utils/validacao.ts`) sem confirmar que ainda bate com a regra do backend?
- [ ] `npx tsc -b --noEmit` e `npm run lint` foram executados após a mudança, sem novos erros?

## Referências
Ver seção "Referências" ao final de `clean-code.md`, `react-guidelines.md`, `typescript-guidelines.md` e `mantine-guidelines.md`.
