import { questoes as servicoQuestoes } from '@/dominios/simulados/service'
import type { ConteudoPlano } from '@/dominios/planejamento/types'
import { VinculoConteudo } from './VinculoConteudo'
import type { TextosVinculoConteudo, VinculoConteudoQuestaoProps } from './types'

const TEXTOS: TextosVinculoConteudo = {
  vinculado: 'Conteúdo vinculado à questão',
  removido: 'Conteúdo removido da questão',
  semEscopo: 'Selecione a disciplina do simulado para vincular conteúdos.',
  semVinculos: 'Nenhum conteúdo vinculado — sem isso, esta questão fica fora do cálculo de desempenho por conteúdo.',
  descricaoModal: 'Selecione um ou mais conteúdos do plano de ensino desta disciplina para vincular a esta questão.',
  modalVazio: 'Todos os conteúdos desta disciplina já foram vinculados, ou ainda não há plano de ensino cadastrado para ela.',
}

export function VinculoConteudoQuestao({ questaoId, disciplinaId, ...resto }: VinculoConteudoQuestaoProps) {
  return (
    <VinculoConteudo
      {...resto}
      entidadeId={questaoId}
      escopoId={disciplinaId}
      pertenceAoEscopo={(conteudo: ConteudoPlano) => conteudo.planoEnsino?.turmaDisciplina?.disciplina?.id === disciplinaId}
      servico={servicoQuestoes}
      textos={TEXTOS}
    />
  )
}
