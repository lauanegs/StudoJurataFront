import { Plus, Sparkles } from 'lucide-react'

import { VinculoConteudoQuestao } from '@/components/planejamento/VinculoConteudo'
import { QuestaoEditor } from '@/components/simulados/QuestaoEditor'
import { StatusBadge } from '@/components/simulados/StatusBadge'
import { Button } from '@/components/ui/Button'
import { EstadoVazio } from '@/components/feedback/EstadoVazio'
import { MAXIMO_QUESTOES } from './questoes'

import type { AbaQuestoesProps } from './types'

/** Aba "Questões" do formulário: editor da questão ativa com a navegação entre as questões do simulado. */
export function AbaQuestoes({
  questoes,
  questaoAtiva,
  errosQuestoes,
  somenteLeitura,
  disciplinaId,
  onSelecionar,
  onAlterar,
  onAdicionar,
  onRemover,
  onImportar,
}: AbaQuestoesProps) {
  const questao = questoes[questaoAtiva]

  return (
    <>
      {questao && (
        <QuestaoEditor
          questao={questao}
          indice={questaoAtiva}
          total={questoes.length}
          somenteLeitura={somenteLeitura}
          erros={errosQuestoes[questaoAtiva]}
          onChange={(atualizada) => onAlterar(questaoAtiva, atualizada)}
          onRemove={() => onRemover(questaoAtiva)}
          onImport={onImportar}
          conteudo={
            <VinculoConteudoQuestao
              questaoId={questao.id}
              disciplinaId={questao.disciplinaId ?? disciplinaId}
              somenteLeitura={somenteLeitura}
              conteudoPlanoIdsPendentes={questao.conteudoPlanoIdsPendentes}
              onChangePendentes={(ids) => onAlterar(questaoAtiva, { ...questao, conteudoPlanoIdsPendentes: ids })}
            />
          }
          navegador={
            <>
              {questoes.map((_, indice) => (
                <StatusBadge
                  key={indice}
                  shape="square"
                  color={errosQuestoes[indice] ? 'red' : indice === questaoAtiva ? 'purple' : 'gray'}
                  selected={indice === questaoAtiva}
                  ariaLabel={`Ir para a questão ${indice + 1}`}
                  onClick={() => onSelecionar(indice)}
                >
                  {indice + 1}
                </StatusBadge>
              ))}

              {!somenteLeitura && questoes.length < MAXIMO_QUESTOES && (
                <Button variant="secondary" size="small" icon={<Plus />} onClick={onAdicionar}>
                  Nova questão
                </Button>
              )}
            </>
          }
        />
      )}

      {questoes.length === 0 && (
        <EstadoVazio
          titulo="Nenhuma questão"
          descricao="Adicione ao menos uma questão para o simulado."
          icon={<Sparkles />}
          acao={<Button icon={<Plus />} onClick={onAdicionar}>Adicionar questão</Button>}
        />
      )}
    </>
  )
}
