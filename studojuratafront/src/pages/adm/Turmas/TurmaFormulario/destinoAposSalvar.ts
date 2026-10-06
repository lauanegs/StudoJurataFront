/** Para onde ir depois de salvar uma turma recém-criada */
export function rotaDaTurmaCriada(turmaCriada: { id?: number } | null | undefined): string | null {
  return turmaCriada?.id ? `/adm/turmas/${turmaCriada.id}` : null
}
