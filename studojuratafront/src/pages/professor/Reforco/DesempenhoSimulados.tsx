import { useMemo, useState } from 'react'
import { ClipboardList, TrendingUp } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Tag } from '../../../components/ui/Tag'
import { DetalheSimuladoModal } from './DetalheSimuladoModal'
import { FiltrosDesempenho } from './FiltrosDesempenho'
import { useDesempenhoDados, type DesempenhoSimulado } from './useDesempenhoDados'
import { nivelDesempenho } from '../../../utils/desempenho'
import type { TagVariant } from '../../../components/ui/Tag'
import type { Coluna } from '../../../components/ui/DataTable/types'

// Padronizado com as outras telas que mostram nível de desempenho em tabela
// (ex.: Notas) — mesma paleta success/warning/error do gráfico e do card.
const VARIANTE_POR_NIVEL: Record<'baixo' | 'medio' | 'alto', TagVariant> = {
  baixo: 'error',
  medio: 'warning',
  alto: 'success',
}

/**
 * Versão filtrável, em tabela, do card "Desempenho por simulado" do painel de
 * Desempenho. "Detalhar" abre o DetalheSimuladoModal respeitando o aluno filtrado.
 */
export default function DesempenhoSimulados() {
  const {
    turmaId,
    setTurmaId,
    disciplinaId,
    setDisciplinaId,
    alunoId,
    setAlunoId,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    filtrosAplicados,
    buscar,
    limparFiltros,
    opcoesTurmas,
    opcoesDisciplinas,
    opcoesAlunos,
    carregandoAlunos,
    carregandoVinculos,
    desempenhos,
    tentativas,
    loading,
    error,
    reload,
  } = useDesempenhoDados()

  const [simuladoDetalhado, setSimuladoDetalhado] = useState<DesempenhoSimulado | null>(null)

  // Nome do aluno filtrado, pra deixar claro no modal que os dados ali
  // (gráfico, alerta, tabela) são só daquele aluno, não da turma toda — usa
  // o filtro APLICADO (não o formulário, que pode estar com um aluno
  // diferente selecionado sem o professor ter clicado em "Buscar" ainda).
  const alunoFiltrado = filtrosAplicados.alunoId
    ? opcoesAlunos.find((opcao) => opcao.value === filtrosAplicados.alunoId)?.label
    : undefined

  // O modal não recebe o resumo de filtros: ele já mostra os dados do próprio simulado.

  // Mais recente primeiro; sem dataInicio nem createdAt, o item fica no fim.
  const desempenhosPorData = useMemo(
    () =>
      [...desempenhos].sort((a, b) => {
        if (!a.data && !b.data) return 0
        if (!a.data) return 1
        if (!b.data) return -1
        return new Date(b.data).getTime() - new Date(a.data).getTime()
      }),
    [desempenhos],
  )

  const colunas: Coluna<DesempenhoSimulado>[] = [
    { key: 'titulo', cabecalho: 'Título', render: (item) => item.titulo },
    { key: 'turma', cabecalho: 'Turma', ocultarEmTelaPequena: true, render: (item) => item.turma },
    { key: 'disciplina', cabecalho: 'Disciplina', ocultarEmTelaPequena: true, render: (item) => item.disciplina },
    {
      key: 'percentual',
      cabecalho: 'Desempenho',
      ordenavel: true,
      valorOrdenacao: (item) => item.percentual,
      render: (item) => (
        <Tag variant={VARIANTE_POR_NIVEL[nivelDesempenho(item.percentual)]}>{Math.round(item.percentual)}%</Tag>
      ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Desempenho por simulado"
        voltarPara="/professor/desempenho"
        rotuloVoltar="Desempenho"
        filtros={
          <FiltrosDesempenho
            opcoesTurmas={opcoesTurmas}
            opcoesDisciplinas={opcoesDisciplinas}
            opcoesAlunos={opcoesAlunos}
            turmaId={turmaId}
            disciplinaId={disciplinaId}
            alunoId={alunoId}
            dataInicio={dataInicio}
            dataFim={dataFim}
            carregandoTurmas={carregandoVinculos}
            carregandoAlunos={carregandoAlunos}
            onTurmaChange={setTurmaId}
            onDisciplinaChange={setDisciplinaId}
            onAlunoChange={setAlunoId}
            onDataInicioChange={setDataInicio}
            onDataFimChange={setDataFim}
            onBuscar={buscar}
            onLimpar={limparFiltros}
          />
        }
      />

      <DataTable<DesempenhoSimulado>
        columns={colunas}
        data={desempenhosPorData}
        rowKey={(item) => item.simuladoId}
        loading={loading}
        error={error}
        onReload={reload}
        empty={{
          titulo: 'Nada encontrado',
          descricao: 'Não há simulados concluídos para os filtros selecionados.',
          icon: <TrendingUp />,
        }}
        actions={(item) => (
          <Button
            variant="subtle"
            size="small"
            icon={<ClipboardList />}
            onClick={() => setSimuladoDetalhado(item)}
          >
            Detalhar
          </Button>
        )}
      />

      <DetalheSimuladoModal
        aberto={Boolean(simuladoDetalhado)}
        onClose={() => setSimuladoDetalhado(null)}
        simuladoId={simuladoDetalhado?.simuladoId ?? null}
        titulo={simuladoDetalhado?.titulo ?? ''}
        turma={simuladoDetalhado?.turma ?? ''}
        disciplina={simuladoDetalhado?.disciplina ?? ''}
        notaMaxima={simuladoDetalhado?.notaMaxima ?? 10}
        tentativas={tentativas.filter(
          (tentativa) =>
            tentativa.simuladoId === simuladoDetalhado?.simuladoId &&
            tentativa.status === 'CONCLUIDO' &&
            (!filtrosAplicados.alunoId || tentativa.alunoId === filtrosAplicados.alunoId),
        )}
        data={simuladoDetalhado?.data}
        tipoDestinacao={simuladoDetalhado?.tipoDestinacao}
        alunoFiltrado={alunoFiltrado}
      />
    </Layout>
  )
}
