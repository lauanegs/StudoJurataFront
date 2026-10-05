import { useState } from 'react'
import { Eye, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { IconButton } from '@/components/ui/IconButton'
import { LinhaCampos } from '@/components/ui/LinhaCampos'
import { Select } from '@/components/ui/Select'
import { OPCOES_PARENTESCO, ROTULO_PARENTESCO } from '@/utils/labels'
import type { Parentesco } from '@/dominios/pessoas/types'

import type { ItemVinculo, VinculoResponsavelAlunoProps } from './types'

/**
 * Mesmo padrão da aba Disciplinas da turma: card com os campos e o botão
 * "Vincular" e, abaixo, a tabela dos vínculos já feitos.
 */
export function VinculoResponsavelAluno({
  titulo,
  rotuloCampo,
  opcoes,
  carregandoOpcoes,
  itens,
  carregandoItens,
  erroItens,
  onRecarregar,
  desabilitado,
  aoVincular,
  aoRemover,
  aoVer,
}: VinculoResponsavelAlunoProps) {
  const [id, setId] = useState<number | null>(null)
  const [parentesco, setParentesco] = useState<Parentesco | null>(null)
  const [erroId, setErroId] = useState<string>()
  const [erroParentesco, setErroParentesco] = useState<string>()
  const [salvando, setSalvando] = useState(false)

  async function vincular() {
    setErroId(id ? undefined : `Selecione ${rotuloCampo === 'Aluno' ? 'o aluno' : 'o responsável'}`)
    setErroParentesco(parentesco ? undefined : 'Selecione o parentesco')
    if (!id || !parentesco) return

    setSalvando(true)
    try {
      await aoVincular(id, parentesco)
      setId(null)
      setParentesco(null)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <Card titulo={titulo}>
        <LinhaCampos $colunas="2fr 1fr auto">
          <Select<number>
            label={rotuloCampo}
            required
            options={opcoes}
            value={id}
            loading={carregandoOpcoes}
            error={erroId}
            disabled={desabilitado || salvando}
            searchable
            placeholder={`Selecionar ${rotuloCampo === 'Aluno' ? 'aluno' : 'responsável'}...`}
            emptyText={rotuloCampo === 'Aluno' ? 'Nenhum aluno disponível para vincular' : 'Cadastre um responsável primeiro'}
            onChange={(valor) => {
              setId(valor)
              setErroId(undefined)
            }}
          />

          <Select<Parentesco>
            label="Parentesco"
            required
            options={OPCOES_PARENTESCO.map((opcao) => ({ value: opcao.value, label: opcao.label }))}
            value={parentesco}
            error={erroParentesco}
            disabled={desabilitado || salvando}
            placeholder="Selecione..."
            onChange={(valor) => {
              setParentesco(valor)
              setErroParentesco(undefined)
            }}
          />

          <Button size="large" icon={<Plus />} loading={salvando} disabled={desabilitado} onClick={vincular}>
            Vincular
          </Button>
        </LinhaCampos>
      </Card>

      <DataTable<ItemVinculo>
        descricao={titulo}
        columns={[
          { key: 'nome', cabecalho: rotuloCampo, render: (item) => item.nome },
          {
            key: 'parentesco',
            cabecalho: 'Parentesco',
            render: (item) => (item.parentesco ? ROTULO_PARENTESCO[item.parentesco] : '—'),
          },
        ]}
        data={itens}
        rowKey={(item) => item.chave}
        loading={carregandoItens}
        error={erroItens}
        onReload={onRecarregar}
        densidade="compacta"
        empty={{
          titulo: rotuloCampo === 'Aluno' ? 'Nenhum aluno vinculado' : 'Nenhum responsável vinculado',
          descricao: 'Use os campos acima para criar o vínculo.',
        }}
        actions={(item) => (
          <>
            {aoVer && (
              <IconButton label={`Ver ${item.nome}`} icon={<Eye />} onClick={() => aoVer(item)} />
            )}
            <IconButton
              label={`Remover ${item.nome}`}
              icon={<Trash2 />}
              variant="danger"
              disabled={desabilitado}
              onClick={() => aoRemover(item)}
            />
          </>
        )}
      />
    </>
  )
}
