# Fidelidade ao Protótipo do Figma — StudoJurataFront

> Esta regra é normativa, não descritiva: diferente dos demais documentos em `docs/`, que registram o que o código **já faz**, este documento define o que a Claude **deve fazer** a partir de agora em toda alteração visual. Aplica-se em conjunto com `docs/mantine-guidelines.md`, `docs/code-review.md` e `docs/refactoring-guidelines.md`, que já foram atualizados para referenciar esta regra.

**Arquivo Figma do projeto:** https://www.figma.com/design/vWqFpdxs0jHWtNMQn1Q6W4/StudoJurata?node-id=0-1&m=dev

## Regra fundamental

**O protótipo do Figma é a fonte de verdade (source of truth) para a interface visual do frontend.** Durante implementação e, principalmente, durante refatorações, a interface deve manter o máximo de fidelidade possível ao design definido no Figma.

Isso já é uma prática real e estabelecida neste projeto — o código está cheio de comentários como `// Confirmado no Figma: ...` (`Button.tsx`, `Header/styles.ts`, `Input/Input.tsx`, `QuestaoEditor/*`, `Sidebar/styles.ts`, `Login.tsx`, entre outros) e até referências a node-id específicos (`Login.tsx`: *"Figma (node "1:3283", "Vector 1")"*). Este documento formaliza essa prática como regra obrigatória, não apenas como convenção observada.

## O que verificar no Figma antes de uma alteração visual significativa

Antes de alterar uma tela ou componente visual de forma perceptível, analisar o nó correspondente no protótipo e respeitar:

- layout;
- espaçamentos;
- alinhamentos;
- dimensões;
- proporções;
- tipografia, tamanhos e pesos de fonte;
- cores;
- bordas e `border-radius`;
- sombras;
- ícones;
- imagens;
- componentes e seus estados (default, hover, focus, disabled, erro, loading);
- hierarquia visual;
- grids;
- responsividade e comportamento visual em diferentes tamanhos de tela.

**"Alteração visual significativa"** = qualquer mudança que um usuário notaria olhando a tela: layout, espaçamento, cor, tipografia, tamanho, posicionamento, comportamento responsivo, aparência de um componente. Não inclui refatoração puramente interna (renomear variável, extrair função, trocar a forma como um valor é calculado) que não muda nada do que é renderizado — mas *qualquer dúvida sobre se algo é "puramente interno" deve ser tratada como significativa*, e verificada.

## Regra de prioridade

Quando houver diferença entre uma implementação existente e o protótipo do Figma, **o Figma é a referência visual principal**, não a implementação atual nem a preferência da Claude. Especificamente:

- **Não alterar o design por preferência pessoal da IA.** Achar um espaçamento "esquisito", uma cor "poderia ser mais suave", ou um layout "ficaria melhor assim" não é justificativa para divergir do Figma. Se algo no Figma parecer genuinamente um problema de design, **sinalizar ao usuário e perguntar**, nunca decidir sozinha e mudar.
- **Não simplificar ou modificar elementos visuais só porque existe uma implementação tecnicamente mais simples.** Um `border-radius` assimétrico, uma sombra composta, um degradê em ângulo específico, um espaçamento que não bate com nenhum token redondo — se é o que o Figma define, é o que deve ser implementado, mesmo que uma versão "mais limpa" fosse mais fácil de escrever.
- **A simplificação deve acontecer no código, não no design.** Reduzir complexidade é sempre bem-vindo *na forma como o resultado visual é alcançado* (menos CSS duplicado, um token reaproveitado, um componente Mantine configurado em vez de `styled` cru) — nunca *no resultado visual em si*. Ver "Critério de aceitação visual" abaixo: simplificar a implementação não pode custar fidelidade ao protótipo.

## Mantine e fidelidade ao Figma

Isto reforça e tem prioridade sobre a orientação geral de `docs/mantine-guidelines.md`:

- Usar componentes do Mantine sempre que eles permitirem reproduzir adequadamente o design do Figma — é a preferência padrão do projeto (ver `docs/mantine-guidelines.md`).
- **O uso do Mantine nunca deve ser justificativa para alterar o design.** Se o componente padrão do Mantine não bate visualmente com o Figma, o caminho é personalizá-lo (via `styles`, `variant`, tema, props), não aceitar a aparência padrão do Mantine "porque é o que vem de fábrica".
- Quando a configuração padrão do Mantine não corresponder ao Figma, personalizar o componente adequadamente para reproduzir o protótipo — como já é feito em `Button.tsx` (tamanhos, gradientes e raio próprios do projeto por cima do `MantineButton` base).
- Antes de criar um componente visual próprio do zero, verificar se um componente Mantine existente, configurado, atende ao design — mesma regra de `docs/mantine-guidelines.md`, reafirmada aqui porque a motivação frequentemente aparece junto: "o Mantine não faz exatamente isso" não é motivo para nem tentar configurá-lo, nem motivo para aceitar uma versão visualmente diferente do Figma.

## Responsividade

O Figma é também a referência para comportamento responsivo, não só para o layout de um tamanho de tela fixo.

**Não presumir que `width: 100%` ou empilhar elementos verticalmente é, por si, uma implementação responsiva correta.** Isso pode estar certo ou errado dependendo do que o protótipo realmente define — a única forma de saber é olhar o Figma.

Ao implementar/revisar responsividade, analisar no protótipo:
- breakpoints;
- mudanças de layout entre tamanhos;
- espaçamentos por tamanho de tela;
- tamanhos de elementos por tamanho de tela;
- posicionamento;
- ocultação/exibição de elementos (o projeto já tem um exemplo real disso: a prop `ocultarEmTelaPequena` de `Coluna<T>` no `DataTable`, usada em `Alunos.tsx` para esconder a coluna de CPF em telas pequenas — esse tipo de decisão deve vir do Figma, não de intuição);
- comportamento de menus (ex.: `Sidebar` colapsada/expandida);
- grids;
- cards;
- textos (truncamento, quebra de linha, tamanho);
- imagens (corte, proporção, ocultação).

- **Quando o Figma tiver versões para diferentes tamanhos de tela** (frames mobile/tablet/desktop, ou variantes de breakpoint), seguir essas versões como referência direta — não inferir.
- **Quando não houver uma versão específica para um tamanho de tela**, inferir o comportamento preservando a *intenção visual* do design (hierarquia, agrupamento, proporção relativa dos elementos), não aplicando uma regra genérica de framework CSS sem relação com o que o design pretende comunicar naquele contexto.

## Antes de alterar uma interface

Antes de modificar uma tela ou componente visual, seguir esta sequência:

1. **Verificar o design correspondente no Figma** (arquivo acima; usar as ferramentas MCP do Figma disponíveis no ambiente — `get_design_context`, `get_screenshot`, `get_metadata`, `get_variable_defs` — já autorizadas neste projeto em `.claude/settings.local.json`; carregar a skill `figma-design-to-code` antes de chamar `get_design_context`, conforme exigido pelo próprio ambiente).
2. **Comparar a implementação atual com o protótipo** — abrir a tela no navegador (dev server) lado a lado com o frame correspondente no Figma.
3. **Identificar diferenças** entre o que existe hoje e o que o Figma define.
4. **Determinar se a alteração solicitada afeta o design** — a tarefa pedida é sobre comportamento/código (não deveria mudar nada visual) ou sobre a interface em si (precisa bater com o Figma no resultado)?
5. **Preservar os elementos visuais que não fazem parte da alteração solicitada.** Uma tarefa pedida para o cabeçalho de uma tela não é licença para "ajustar" o espaçamento de uma tabela na mesma tela, mesmo que pareça uma melhoria.

Quando não for possível consultar o Figma diretamente (ferramenta indisponível, sem autenticação no momento), **não presumir** — usar os comentários `// Confirmado no Figma: ...` já presentes no código como a melhor fonte disponível, e sinalizar ao usuário que a verificação direta no protótipo não foi possível para aquela mudança específica.

## Durante refatorações

Refatoração de código **não deve resultar em mudanças visuais acidentais**. Se uma refatoração alterar:

- espaçamento;
- tamanho;
- alinhamento;
- cores;
- tipografia;
- responsividade;
- posicionamento;
- aparência de componentes;

→ verificar novamente o resultado contra o Figma antes de considerar a refatoração concluída, mesmo que a intenção original da tarefa fosse "só" mexer em código (ex.: migrar um componente de `styled-components` para Mantine, dividir um componente grande, extrair um hook). Ver `docs/refactoring-guidelines.md`, que já incorpora esta verificação nos passos 5 ("planejar"), 8 ("verificar regressões") e 9 ("revisar novamente").

## Critério de aceitação visual

Uma implementação **não deve ser considerada concluída apenas porque**:
- compila;
- não possui erros de TypeScript;
- os componentes funcionam;
- os testes passam (quando existirem).

O resultado final deve ser avaliado em três dimensões, todas obrigatórias:

1. **Funcionalidade** — o comportamento está correto?
2. **Código** — o código está simples, limpo e manutenível (ver `docs/clean-code.md`, `docs/react-guidelines.md`, `docs/typescript-guidelines.md`)?
3. **Visual** — a interface está fiel ao Figma?

As três dimensões devem ser consideradas juntas, tanto na implementação quanto na refatoração. Uma mudança que melhora a dimensão 2 (código) às custas da dimensão 3 (visual) não é uma melhoria — é uma regressão disfarçada de limpeza.

## Regra principal (resumo)

**O objetivo é melhorar a qualidade do código sem perder a fidelidade visual do produto. Simplificar a implementação, não simplificar o design.**

## Referências
- [Arquivo Figma do projeto — StudoJurata](https://www.figma.com/design/vWqFpdxs0jHWtNMQn1Q6W4/StudoJurata?node-id=0-1&m=dev)
- `docs/mantine-guidelines.md` — como reproduzir o Figma usando componentes Mantine.
- `docs/refactoring-guidelines.md` — onde a verificação visual entra no processo de refatoração.
- `docs/code-review.md` — checklist de revisão, seção "Fidelidade ao Figma".
