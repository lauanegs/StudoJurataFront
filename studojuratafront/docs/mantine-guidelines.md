# Mantine Guidelines — StudoJurataFront

`@mantine/core` 9.5.1, `@mantine/hooks` 9.5.1, `@mantine/dates` 9.5.1. **Antes de criar ou refatorar qualquer componente visual, verificar se o Mantine já resolve** — o projeto está numa migração ativa nessa direção (ver `docs/architecture.md` seção 4) e qualquer trabalho novo deve reforçá-la, não ir contra.

## Regra principal

Priorizar componentes oficiais do Mantine (`Button`, `TextInput`, `Select`, `Modal`, `Drawer`, `Paper`, `Stack`, `Group`, `Flex`, `Grid`, `Container`, `Table`, `Tabs`, `Notification`, etc.) em vez de criar equivalente próprio do zero, e evitar CSS customizado quando uma prop do Mantine (`styles`, `variant`, `color`, tokens de tema) já resolve. Isso vale tanto para componente **novo** quanto para revisão de um componente **existente** que ainda usa `styled-components` — mas migrar um componente existente é uma decisão a avaliar por componente (ver seção "Quando não migrar agora"), não uma obrigação automática só porque este guia existe.

**Prioridade sobre esta regra: o Figma é a fonte de verdade visual do projeto (ver `docs/figma-fidelity.md`).** "Usar Mantine" nunca é motivo para aceitar um resultado visual diferente do protótipo — se a aparência padrão de um componente Mantine não bate com o Figma, o componente é personalizado (via `styles`/`variant`/tema/props) até bater, não o design que cede à conveniência da biblioteca. Antes de qualquer criação/revisão de componente visual, checar o [Figma](https://www.figma.com/design/vWqFpdxs0jHWtNMQn1Q6W4/StudoJurata?node-id=0-1&m=dev), não só se "o Mantine tem um componente parecido".

## Padrão real já estabelecido no projeto: wrapper fino sobre Mantine

Os ~26 componentes de `components/ui/` já migrados **não usam o Mantine diretamente nas telas** — eles envolvem o componente Mantine com a API própria do design system do projeto (nomes de prop em português/domínio, valores de `variant`/`size` específicos do Figma do projeto), e é esse wrapper que as páginas importam. Exemplo real (`components/ui/Button/Button.tsx`):

```tsx
export function Button({ children, label, variant = 'primary', size = 'medium', icon, ... }: ButtonProps) {
  return (
    <MantineButton
      variant={...}
      color={...}
      leftSection={comTamanho(icon, ICON_SIZES[size])}
      styles={{ root: { ...SIZE_STYLES[size] } }}
      {...rest}
    >
      {children ?? label}
    </MantineButton>
  )
}
```

**Esse é o padrão a seguir**, não uma exceção: ao migrar ou criar um componente de design system, envolver o componente Mantine correspondente, mantendo a API pública (`variant`, `size`, `icon`...) que o resto do projeto já espera — permite trocar a implementação por baixo sem tocar em nenhuma tela que já usa o componente. **Não é** "criar um componente próprio equivalente ao do Mantine" no sentido que este guia pede para evitar — é uma camada de adaptação de design system, fina o bastante para não duplicar a lógica que o Mantine já resolve (foco, acessibilidade, estados, responsividade).

Nas **páginas**, o padrão é importar de `components/ui/`, não de `@mantine/core` diretamente — mantém a página desacoplada da biblioteca de UI de baixo nível, e é consistente com o restante do código-base (nenhuma página inspecionada importa `@mantine/core` diretamente).

## Estado real da migração (medido nesta análise)

- **26 de 46** componentes de `components/ui/` já delegam para Mantine.
- **20 de 46** ainda usam `styled-components` (arquivo `styles.ts` próprio ou `styled()` inline), entre eles `Field`, `Header`, `IconButton`, `CircularProgress`, `LetterBadge`, `QuestaoEditor`, `StatusBadge`.
- **29 páginas** ainda importam `styled-components` diretamente para ajuste de layout específico da tela.

## Quando migrar um componente para Mantine

Bons candidatos (ao tocar o componente por outro motivo, ou quando explicitamente pedido):
- O componente reimplementa algo que o Mantine já tem pronto e testado (modal, dropdown, tooltip, popover, transição, foco preso/`trap focus`) — reimplementar isso à mão é risco de acessibilidade sem ganho.
- O CSS customizado do componente só define espaçamento/cor/tipografia que os tokens do tema Mantine (`styles/mantineTheme.ts`) já cobrem.
- Migrar reduz código sem mudar o comportamento/aparência observável (o objetivo declarado da migração em curso: "nada muda visualmente para quem olha o app").

## Quando não migrar agora

- O componente tem uma necessidade visual muito específica do Figma do projeto que exigiria sobrescrever tanto do Mantine (`styles` profundamente aninhado) que o styled-components atual já é mais direto — não forçar Mantine "porque sim" se o resultado fica mais complexo, não mais simples.
- Migrar mudaria comportamento/contrato observável (props que a tela consumidora espera) sem que isso tenha sido pedido — sinalizar antes, como qualquer mudança de comportamento (ver `docs/refactoring-guidelines.md`).
- O componente está isolado, é usado em pouquíssimos lugares, e migrá-lo agora não desbloqueia nada — pode esperar uma tarefa dedicada em vez de "aproveitar" uma tarefa não relacionada.

## Componentes próprios que são justificados (não duplicam Mantine)

Nem todo componente em `components/ui/` é um wrapper — alguns existem porque resolvem algo que o Mantine **não** oferece pronto:
- `DataTable` — Mantine tem `Table` (a peça de HTML), mas não paginação + ordenação + estado vazio/erro/loading + ações por linha integrados; `DataTable` é a composição própria do projeto sobre `Table`/`Pagination` do Mantine para esse conjunto de comportamento. Não é duplicação, é composição de mais alto nível — não recomendamos "desfazer" isso para usar só `Table` cru.
- `QuestaoEditor` — editor de questão/alternativas específico do domínio do projeto (Simulados/IA), sem equivalente no Mantine, naturalmente.
- Cards de domínio (`AlunoCard`... na verdade `ConquistaCard`, `EnunciadoSimuladoCard`, `SkinCard`, etc.) — composições visuais específicas do produto sobre `Paper`/`Card` do Mantine, legítimas.

Ao revisar, distinguir **"componente que deveria ter sido só Mantine"** (ex.: um card genérico que só usa `Paper` + `Stack` + texto, sem nada de específico) de **"componente que compõe Mantine para resolver algo específico do domínio"** (justificado).

## Evitar CSS customizado quando a API do Mantine resolve

Antes de escrever `styled-components`/CSS novo, checar se a prop do Mantine já resolve:
- Espaçamento entre elementos → `Stack`/`Group`/`Flex` com prop `gap`, não `margin` manual.
- Layout responsivo → `Grid`/`SimpleGrid` com props de breakpoint, não media query escrita à mão (a não ser que o breakpoint não exista nos tokens do tema).
- Cor/variante visual → `color`/`variant`/`gradient` do componente Mantine + tokens de `mantineTheme.ts`, não hex hardcoded no CSS (o projeto já centraliza cores de marca em `brandPurple`/`brandTeal`/`brandDanger`/`brandSuccess`).
- Sombra/raio/tipografia → tokens do tema (`shadows`, `radius`, `fontSizes` já configurados em `mantineTheme.ts`), não valor mágico solto em `styled.div`.

## Padrões Mantine já em uso no projeto (para manter consistência)

- `MantineProvider` com `theme={mantineTheme}` (tema próprio, não o padrão do Mantine) montado em `main.tsx`, junto com `DatesProvider` (`@mantine/dates`, locale `pt-br`, `firstDayOfWeek: 0`) para os componentes de data.
- Paleta de marca declarada como `MantineColorsTuple` de 10 tons (`brandPurple`, `brandTeal`, `brandDanger`, `brandSuccess`) em vez de usar as cores padrão do Mantine (`blue`, `red`...) — usar essas cores nomeadas ao passar `color="..."` para um componente Mantine, não introduzir uma cor nova sem adicioná-la ao tema.
- `radius="md"` como padrão visual dos componentes (`defaultRadius: 'md'` no tema) — não hardcodar `radius` numérico solto quando o token já resolve.
- Ícones: `lucide-react`, não os ícones do `@mantine/core` (que não inclui um pacote de ícones por padrão) — passados via `leftSection`/`rightSection` como já é feito em `Button`.
- `styles` prop (objeto de estilos por parte interna do componente, ex. `styles={{ root: {...} }}`) para ajuste fino além do que as props de alto nível cobrem — é o mecanismo usado no projeto para aplicar os tokens de `theme.ts` (tamanho/peso de fonte por variante) sem sair do sistema de estilo do Mantine.

## Referências
- [Mantine — Documentação oficial](https://mantine.dev/)
- [Mantine — Theming](https://mantine.dev/theming/theme-object/)
- [Mantine — Styles API](https://mantine.dev/styles/styles-api/)
