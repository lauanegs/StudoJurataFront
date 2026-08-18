/**
 * Confirmado no Figma: a borda dos campos de formulário é mais suave no
 * estado normal (o traço tem opacidade reduzida) e só fica sólida quando o
 * campo está em foco. Como as cores em `theme.ts` são hex sólido, esta
 * função converte pra rgba com o alpha desejado.
 */
export function corComOpacidade(hex: string, alpha: number): string {
  const valor = hex.replace('#', '')
  const r = parseInt(valor.slice(0, 2), 16)
  const g = parseInt(valor.slice(2, 4), 16)
  const b = parseInt(valor.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
