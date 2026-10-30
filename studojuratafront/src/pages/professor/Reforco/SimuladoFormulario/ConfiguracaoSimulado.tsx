import { Users } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { DatePicker } from '@/components/ui/DatePicker'
import { GradeAutoAjuste } from '@/components/ui/GradeAutoAjuste'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Stack } from '@/components/ui/Stack'
import * as SVinculo from '@/components/planejamento/VinculoConteudo/styles'
import { OPCOES_DESTINACAO } from '@/utils/labels'
import type { TipoDestinacaoSimulado } from '@/dominios/simulados/types'

import type { ConfiguracaoSimuladoProps } from './types'

export function ConfiguracaoSimulado({
  form,
  somenteLeitura,
  podeEstenderDisponibilidade,
  opcoesDisciplinas,
  opcoesTurmas,
  opcoesPlanos,
  carregandoDisciplinas,
  carregandoTurmas,
  carregandoPlanos,
  alunosSelecionados,
  onSelecionarAlunos,
  onRemoverAluno,
  onTrocarTurma,
}: ConfiguracaoSimuladoProps) {
  const { titulo, disciplinaId, turmaId, planoEnsinoId, tipoDestinacao, dataInicio, dataFim, tempoLimite, notaMaxima } =
    form.values
  const erros = form.errors as Record<string, string | undefined>

  return (
    <Card titulo="Configuração do simulado">
      <Stack gap="md">
        <GradeAutoAjuste $larguraMinima="220px">
          <Input
            label="Título"
            required
            placeholder="Ex.: Reforço de frações"
            value={titulo}
            error={erros.titulo}
            disabled={somenteLeitura}
            maxLength={150}
            onChange={(evento) => form.setFieldValue('titulo', evento.target.value)}
          />

          <Select<number>
            label="Turma"
            required
            options={opcoesTurmas}
            value={turmaId}
            loading={carregandoTurmas}
            error={erros.turmaId}
            disabled={somenteLeitura}
            searchable
            clearable
            placeholder="Selecionar turma..."
            onChange={(valor) => {
              form.setFieldValue('turmaId', valor)
              onTrocarTurma()
            }}
          />

          <Select<number>
            label="Disciplina"
            required
            options={opcoesDisciplinas}
            value={disciplinaId}
            loading={carregandoDisciplinas}
            error={erros.disciplinaId}
            disabled={somenteLeitura || !turmaId}
            searchable
            clearable
            placeholder={turmaId ? 'Selecionar disciplina...' : 'Selecione a turma primeiro'}
            emptyText="Nenhuma disciplina ofertada nesta turma"
            onChange={(valor) => form.setFieldValue('disciplinaId', valor)}
          />

          <Select<number>
            label="Plano de ensino"
            required
            options={opcoesPlanos}
            value={planoEnsinoId}
            loading={carregandoPlanos}
            error={erros.planoEnsinoId}
            disabled={somenteLeitura}
            searchable
            clearable
            placeholder="Selecionar plano..."
            hint="Somente planos da turma e da disciplina escolhidas."
            emptyText="Nenhum plano desta turma e disciplina"
            onChange={(valor) => form.setFieldValue('planoEnsinoId', valor)}
          />

          <Select<TipoDestinacaoSimulado>
            label="Destinação"
            required
            options={OPCOES_DESTINACAO}
            value={tipoDestinacao}
            disabled={somenteLeitura}
            onChange={(valor) => form.setFieldValue('tipoDestinacao', valor ?? 'TODOS')}
          />

          <Input
            label="Tempo limite"
            type="number"
            min={1}
            placeholder="Ex.: 30"
            value={tempoLimite}
            error={erros.tempoLimite}
            disabled={somenteLeitura}
            hint="Em minutos. Deixe vazio para sem limite."
            onChange={(evento) => form.setFieldValue('tempoLimite', evento.target.value)}
          />

          <Input
            label="Nota máxima"
            type="number"
            min={1}
            step="0.5"
            value={notaMaxima}
            error={erros.notaMaxima}
            disabled={somenteLeitura}
            hint="Distribuída igualmente entre as questões."
            onChange={(evento) => form.setFieldValue('notaMaxima', evento.target.value)}
          />
        </GradeAutoAjuste>

        {/* O DatePicker de data e hora tem dois campos internos e corta o texto em colunas mais estreitas */}
        <GradeAutoAjuste $larguraMinima="320px">
          <DatePicker
            label="Disponível a partir de"
            modo="dataHora"
            required
            value={dataInicio}
            error={erros.dataInicio}
            hint="O simulado para a turma toda é publicado sozinho nesta data."
            disabled={somenteLeitura}
            onChange={(evento) => form.setFieldValue('dataInicio', evento.target.value)}
          />

          <DatePicker
            label="Disponível até"
            modo="dataHora"
            value={dataFim}
            error={erros.dataFim}
            hint={
              podeEstenderDisponibilidade
                ? 'Simulado já lançado — só este campo pode ser alterado.'
                : 'O simulado é encerrado sozinho nesta data.'
            }
            disabled={somenteLeitura && !podeEstenderDisponibilidade}
            onChange={(evento) => form.setFieldValue('dataFim', evento.target.value)}
          />
        </GradeAutoAjuste>

        {tipoDestinacao === 'ESPECIFICO' && (
          <SVinculo.SecaoVinculo>
            <SVinculo.CabecalhoVinculo>
              <SVinculo.TituloVinculo>Alunos</SVinculo.TituloVinculo>

              {!somenteLeitura && (
                <Button size="small" icon={<Users />} disabled={!turmaId} onClick={onSelecionarAlunos}>
                  Selecionar alunos
                </Button>
              )}
            </SVinculo.CabecalhoVinculo>

            {alunosSelecionados.length === 0 ? (
              <SVinculo.DicaVinculo>
                Nenhum aluno selecionado — a destinação específica exige ao menos um.
              </SVinculo.DicaVinculo>
            ) : (
              <SVinculo.ChipsVinculo>
                {alunosSelecionados.map((aluno) => (
                  <Chip
                    key={aluno.id}
                    variant="neutral"
                    disabled={somenteLeitura}
                    onRemove={somenteLeitura ? undefined : () => onRemoverAluno(aluno.id)}
                    rotuloRemover={`Remover ${aluno.nome}`}
                  >
                    {aluno.nome}
                  </Chip>
                ))}
              </SVinculo.ChipsVinculo>
            )}
          </SVinculo.SecaoVinculo>
        )}
      </Stack>
    </Card>
  )
}
