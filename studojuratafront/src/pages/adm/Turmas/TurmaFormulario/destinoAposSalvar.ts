/**
 * Para onde ir depois de salvar uma turma recém-criada.
 *
 * A regra do fluxo é permanecer na tela: o admin continua no formulário da
 * turma que acabou de criar (mesmo componente, agora em modo de edição) para
 * seguir nas abas de horários/disciplinas. Nunca vai para a listagem — ela só é
 * alcançada pelos botões Cancelar e Inativar. Sem id na resposta, o retorno é
 * `null` e a tela simplesmente permanece onde está, em vez de navegar para uma
 * rota sem turma.
 */
export function rotaDaTurmaCriada(turmaCriada: { id?: number } | null | undefined): string | null {
  return turmaCriada?.id ? `/adm/turmas/${turmaCriada.id}` : null
}
