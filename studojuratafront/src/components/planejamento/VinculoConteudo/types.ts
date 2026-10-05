export interface VinculoConteudoAulaProps {
  /** Ausente quando a aula ainda não foi salva — nesse caso o componente entra em modo local, ver conteudoPlanoIdsPendentes/onChangePendentes. */
  aulaId?: number
  /** Escopo do seletor: só conteúdos deste plano de ensino aparecem como opção. */
  planoEnsinoId?: number | null
  somenteLeitura?: boolean
  /** Modo local (sem aulaId ainda): ids escolhidos ficam só no estado do formulário pai, comitados via API assim que a aula for salva e ganhar id — mesmo princípio de VinculoConteudoQuestao. */
  conteudoPlanoIdsPendentes?: number[]
  onChangePendentes?: (ids: number[]) => void
  /**
   * false em telas onde a aula é sempre escolhida entre as já existentes,
   * nunca criada aqui (RegistrarAulaTurma) — sem aulaId o botão fica
   * bloqueado em vez de abrir o modo local, porque não existe um "salvar"
   * nesta tela capaz de comitar os pendentes depois. Default true
   * (AulaFormulario, que cria a aula).
   */
  permitirModoLocal?: boolean
}

export interface VinculoConteudoQuestaoProps {
  /** Ausente quando a questão ainda não foi salva — nesse caso o componente entra em modo local, ver conteudoPlanoIdsPendentes/onChangePendentes. */
  questaoId?: number
  /** Escopo do seletor: só conteúdos do plano de ensino desta disciplina aparecem como opção. */
  disciplinaId?: number | null
  somenteLeitura?: boolean
  /** Modo local (sem questaoId ainda): ids escolhidos ficam só no estado do formulário pai, comitados via API assim que a questão for salva e ganhar id — mesmo princípio das alternativas, que também só existem no back depois do salvar. */
  conteudoPlanoIdsPendentes?: number[]
  onChangePendentes?: (ids: number[]) => void
}
