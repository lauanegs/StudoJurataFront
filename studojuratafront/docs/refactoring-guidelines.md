# Processo de Refatoração — StudoJurataFront

> Aplica-se a qualquer refatoração futura conduzida pela Claude neste projeto. Objetivo: preservar comportamento, layout e responsividade enquanto melhora legibilidade/manutenibilidade — nunca o inverso, e nunca redesenhar algo que não foi pedido. Para qualquer alteração com efeito visual, este processo se combina com `docs/figma-fidelity.md` — o Figma é a fonte de verdade visual do projeto.

## Regra fundamental antes de tudo

**O objetivo não é escrever o máximo de código abstrato — é escrever o código mais simples que resolve corretamente o problema.** Especificamente neste projeto, evitar:
- criar um hook novo para lógica usada (e que só vai ser usada) em um único lugar, sem estado/efeito genuinamente reaproveitável;
- fragmentar um componente legível em vários sub-componentes só para reduzir contagem de linhas;
- introduzir prop drilling deliberado onde Context já existe para o caso (ou, ao contrário, mover algo para Context que só um componente usa);
- duplicar estado que já existe em prop/contexto/outro hook;
- adicionar `useEffect` para algo que `useMemo` ou cálculo direto resolveria;
- criar tipos artificiais (interfaces que só existem para "parecer mais tipado", sem uso real de narrowing/segurança);
- criar um wrapper sobre um componente Mantine sem alterar/adaptar nada de fato (wrapper vazio);
- escrever CSS novo para algo que uma prop do Mantine já resolve;
- criar um componente próprio equivalente a um componente Mantine já disponível.

Se, ao investigar, uma dessas tentações parecer genuinamente justificada, tratar como decisão a **propor e confirmar com o usuário antes de aplicar**, nunca como parte silenciosa de uma limpeza de Clean Code.

## Ordem do processo

### 1. Entender o código
Ler o componente/hook inteiro, não só o trecho aparentemente problemático, e os arquivos diretamente relacionados: o `types.ts` de um componente de `components/ui/`, o hook que uma página usa, o endpoint em `services/endpoints.ts` que alimenta os dados. Ler os comentários — este projeto os usa para explicar decisões não óbvias (por que um `ref` existe, por que uma migração está em andamento), e ignorá-los é o erro mais caro aqui.

### 2. Identificar o comportamento atual
Antes de mudar qualquer linha: o que o componente renderiza em cada estado (loading, erro, vazio, com dados)? O que acontece com uma lista vazia, um campo opcional ausente (`aluno.pessoa?.nome`), um usuário sem permissão para a tela? Se houver dúvida sobre o comportamento real, verificar no navegador antes de mexer (ver skill/processo `run` do projeto) — não presumir pelo nome do componente.

**Se a mudança tem qualquer efeito visual**, este passo inclui também o processo "Antes de alterar uma interface" de `docs/figma-fidelity.md`: consultar o nó correspondente no [Figma](https://www.figma.com/design/vWqFpdxs0jHWtNMQn1Q6W4/StudoJurata?node-id=0-1&m=dev), comparar com a implementação atual, e identificar as diferenças — o "comportamento atual" de uma tela inclui sua aparência, não só sua lógica.

### 3. Identificar problemas
Usar `docs/code-review.md` como guia. Distinguir:
- **Problema real**: causa bug, quebra de layout/responsividade, regressão de comportamento, diverge do Figma sem necessidade, ou torna o código genuinamente difícil de entender/manter.
- **Preferência estilística sem ganho concreto**: não é um problema a corrigir. Isso vale para código **e** para design — um espaçamento/cor/sombra do Figma que parece "poderia ser mais simples" não é um problema a corrigir, é o protótipo.
- **Parte de uma migração em andamento** (styled-components → Mantine): avaliar por componente se é o momento de migrar (`docs/mantine-guidelines.md`), não tratar automaticamente como "código legado a corrigir" — e, ao migrar, o resultado final precisa bater com o Figma tanto quanto (ou mais que) a versão em styled-components batia.

### 4. Classificar os problemas por gravidade
- **Crítico**: bug ativo, quebra de acessibilidade essencial (campo sem label, ação só-ícone sem `aria-label`), dado sensível exposto.
- **Alto**: duplicação de regra de negócio/validação, componente reimplementando algo que um hook existente já resolve, estado duplicado causando dessincronia real.
- **Médio**: componente grande sem separação clara de responsabilidade, `useEffect` desnecessário, prop excessiva.
- **Baixo**: nomenclatura inconsistente, CSS que poderia usar token do Mantine, import fora do padrão dominante.

Priorizar Crítico e Alto. Não misturar uma correção Crítica com uma limpeza Baixa na mesma mudança sem necessidade.

### 5. Planejar a refatoração
Definir o menor conjunto de mudanças que resolve o problema classificado, respeitando `docs/architecture.md` (onde cada tipo de lógica deve morar) e os padrões já existentes (`docs/react-guidelines.md`/`docs/typescript-guidelines.md`/`docs/mantine-guidelines.md`). Se a alteração:
- muda layout ou aparência visual observável,
- muda responsividade (breakpoint, comportamento em tela pequena),
- muda o contrato com a API (`types/index.ts`, `services/endpoints.ts`),
- muda uma regra de negócio/validação existente,
- remove uma funcionalidade,

→ **sinalizar isso ao usuário antes de aplicar**, mesmo que pareça uma melhoria óbvia. Não é uma etapa opcional.

### 6. Fazer a menor alteração necessária
Aplicar só o planejado no passo 5. Resistir a "já que estou aqui" — outro problema notado no caminho deve ser anotado separadamente (ex.: via `spawn_task`, se disponível), não misturado na mesma mudança.

### 7. Executar TypeScript / build / lint
```bash
npx tsc -b --noEmit
npm run lint
```
Uma refatoração que introduz erro de tipo ou de lint não está pronta, independente de quão pequena pareça. `npm run build` (`tsc -b && vite build`) é o check mais completo antes de considerar a mudança finalizada em algo que toque múltiplos arquivos.

### 8. Verificar regressões
Não há testes automatizados neste projeto (`docs/architecture.md` #4) — a verificação é manual:
- Abrir a tela alterada no navegador (dev server) e conferir visualmente contra o que existia antes (layout, responsividade — testar em pelo menos uma largura pequena se o componente for usado em tabela/lista) **e contra o Figma**, não só contra o estado anterior do código — o estado anterior também pode ter divergido do protótipo.
- Se a refatoração alterou espaçamento, tamanho, alinhamento, cores, tipografia, responsividade, posicionamento ou aparência de componentes (mesmo como efeito colateral de uma mudança "só de código"), reconferir especificamente contra o Figma antes de seguir — ver `docs/figma-fidelity.md`, seção "Durante refatorações".
- Testar o fluxo funcional afetado de ponta a ponta (preencher formulário e salvar, filtrar lista, abrir modal) — não só que a tela renderiza sem erro no console.
- Reportar o que foi verificado manualmente, não só "compilou sem erro".

### 9. Revisar novamente o código alterado
Ler o diff inteiro como revisão de outra pessoa, aplicando o checklist completo de `docs/code-review.md`, não só a parte que motivou a mudança.

### 10. Simplificar novamente se ficou complexo demais
Se a solução final tem mais componentes, mais props, mais hooks, ou mais linhas do que o problema original justificava, é sinal de que foi longe demais. Voltar e simplificar antes de considerar a tarefa concluída — mesmo que tecnicamente funcione e os testes/lint passem.

## Preservação — checklist obrigatório em toda refatoração

- **Preservar comportamento** — mesma interação, mesmo resultado para o usuário.
- **Preservar layout** — mesma aparência visual, a não ser que a mudança de aparência seja o próprio objetivo pedido.
- **Preservar fidelidade ao Figma** — se a tela/componente já batia com o protótipo antes da refatoração, continua batendo depois (ver `docs/figma-fidelity.md`). Refatoração de código nunca é desculpa para uma mudança visual acidental.
- **Preservar responsividade** — mesmo comportamento em tela pequena/grande, e mesma correspondência com as versões do Figma por breakpoint quando existirem.
- **Preservar contratos de API** — `types/index.ts`/`services/endpoints.ts` continuam batendo com o que o backend real espera e devolve.
- **Preservar regras de negócio** — validação, formatação, permissão de tela continuam as mesmas.
- **Não substituir uma solução funcional só por preferência pessoal** (ex.: trocar `useState` múltiplo por `useFormulario`, ou styled-components por Mantine) sem que isso resolva um problema real identificado nos passos 3-4. Isso vale tanto para código quanto para design — não simplificar um elemento visual do Figma só porque uma versão mais simples de implementá-lo existe (ver `docs/figma-fidelity.md`).

**Qualquer mudança funcional ou visual deve ser explicitamente identificada e comunicada antes de ser aplicada** — isso vale mesmo dentro de uma tarefa de refatoração "puramente técnica".

## Critério de conclusão — três dimensões

Uma implementação/refatoração não está concluída só porque compila, não tem erro de TypeScript, os componentes funcionam, ou os testes passam (quando existirem). Avaliar sempre as três dimensões antes de reportar a tarefa como pronta:

1. **Funcionalidade** — o comportamento está correto?
2. **Código** — está simples, limpo e manutenível?
3. **Visual** — a interface está fiel ao Figma?

Ver `docs/figma-fidelity.md` para o detalhamento da dimensão 3.
