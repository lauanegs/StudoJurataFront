/**
 * Imprime só o elemento marcado com a classe "area-impressao" da tela atual
 * — o resto (sidebar, header, botões) some via a regra @media print de
 * styles/global.ts. `window.print()` é síncrono em alguns navegadores e
 * assíncrono em outros; "afterprint" cobre os dois casos pra sempre
 * remover a classe depois (imprimiu ou cancelou o diálogo).
 */
export function imprimirRelatorio() {
  document.body.classList.add('imprimindo-relatorio')

  function remover() {
    document.body.classList.remove('imprimindo-relatorio')
    window.removeEventListener('afterprint', remover)
  }

  window.addEventListener('afterprint', remover)
  window.print()
}
