import { aulas as servicoAulas } from '@/dominios/planejamento/service'
import type { ConteudoPlano } from '@/dominios/planejamento/types'
import { VinculoConteudo } from './VinculoConteudo'
import type { TextosVinculoConteudo, VinculoConteudoAulaProps } from './types'

const TEXTOS: TextosVinculoConteudo = {
  vinculado: 'Conteúdo vinculado à aula',
  removido: 'Conteúdo removido da aula',
  semEntidade: 'Selecione uma aula do plano para vincular conteúdos.',
  semEscopo: 'Esta turma ainda não tem plano de ensino — vincule um antes de registrar conteúdo.',
  semVinculos: 'Nenhum conteúdo registrado — registrar o conteúdo alimenta o histórico do aluno e a repetição espaçada da IA.',
  descricaoModal: 'Selecione um ou mais conteúdos do plano de ensino para vincular a esta aula.',
  modalVazio: 'Todos os conteúdos do plano de ensino já foram vinculados a esta aula.',
}

export function VinculoConteudoAula({ aulaId, planoEnsinoId, permitirModoLocal = true, ...resto }: VinculoConteudoAulaProps) {
  return (
    <VinculoConteudo
      {...resto}
      entidadeId={aulaId}
      escopoId={planoEnsinoId}
      pertenceAoEscopo={(conteudo: ConteudoPlano) => conteudo.planoEnsino?.id === planoEnsinoId}
      servico={servicoAulas}
      textos={TEXTOS}
      exigirEntidade={!permitirModoLocal}
    />
  )
}
