import { TrendingUp } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import type { Coluna } from '../../../components/ui/DataTable/types'
import { GraficoCard } from '../../../components/ui/GraficoCard'
import { GraficoLinha } from '../../../components/ui/GraficoLinha'
import { Header } from '../../../components/ui/Header'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { formatarPorcentagem } from '../../../utils/format'
import { FiltrosDesempenho } from './FiltrosDesempenho'
import { ResumoFiltrosDesempenho } from './ResumoFiltrosDesempenho'
import { resumoFiltrosTexto } from './resumoFiltrosTexto'
import { useDesempenhoDados } from './useDesempenhoDados'

interface PontoTabela {
  chave: string
  rotulo: string
  valor: string
}

const colunasPontos: Coluna<PontoTabela>[] = [
  { key: 'rotulo', cabecalho: 'Simulado', render: (item) => item.rotulo },
  { key: 'valor', cabecalho: 'Nota', alinhamento: 'right', render: (item) => item.valor },
]

/**
 * Versão filtrável do card "Evolução ao longo do tempo" do painel de
 * Desempenho. Filtrando por aluno, cada linha mostra a evolução dele, não a
 * média da turma.
 */
export default function DesempenhoEvolucao() {
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
    tendenciaPorDisciplina,
    loading,
    error,
    reload,
  } = useDesempenhoDados()

  // O recorte aplicado aparece só no modal "Detalhar" de cada gráfico.
  const recorteAplicado = {
    opcoesTurmas,
    opcoesDisciplinas,
    opcoesAlunos,
    turmaId: filtrosAplicados.turmaId,
    disciplinaId: filtrosAplicados.disciplinaId,
    alunoId: filtrosAplicados.alunoId,
    dataInicio: filtrosAplicados.dataInicio,
    dataFim: filtrosAplicados.dataFim,
  }
  const resumoFiltros = <ResumoFiltrosDesempenho {...recorteAplicado} />
  const resumoFiltrosTextoAtual = resumoFiltrosTexto(recorteAplicado)

  return (
    <Layout>
      <Header
        titulo="Evolução do desempenho"
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

      {loading ? (
        <Skeleton $altura="240px" $raio="8px" />
      ) : error ? (
        <Card>
          <ErroCarregamento mensagem={error} onRetry={reload} />
        </Card>
      ) : tendenciaPorDisciplina.length === 0 ? (
        <Card>
          <EstadoVazio
            titulo="Sem evolução pra mostrar"
            descricao="É preciso pelo menos 2 simulados com data, na mesma disciplina, dentro dos filtros selecionados."
            icon={<TrendingUp />}
          />
        </Card>
      ) : (
        <GradeAutoAjuste $larguraMinima="280px" $espaco="xl">
          {tendenciaPorDisciplina.map((item) => (
            <GraficoCard
              key={item.disciplina}
              titulo={`Evolução — ${item.disciplina}`}
              descricao="Nota em cada simulado dessa disciplina, em ordem cronológica, considerando os filtros selecionados."
              renderGrafico={(altura) => (
                <GraficoLinha
                  pontos={item.pontos}
                  altura={altura}
                  rotuloAcessivel={`Evolução do desempenho em ${item.disciplina} ao longo do tempo`}
                />
              )}
              contexto={resumoFiltros}
              contextoTexto={resumoFiltrosTextoAtual}
              colunaRotulo="Simulado"
              colunaValor="Nota"
              dados={item.pontos.map((ponto) => ({
                chave: ponto.chave,
                rotulo: ponto.rotulo,
                valor: formatarPorcentagem(ponto.valor),
              }))}
              detalhe={
                <DataTable
                  descricao={`Evolução — ${item.disciplina}`}
                  columns={colunasPontos}
                  data={item.pontos.map((ponto) => ({
                    chave: ponto.chave,
                    rotulo: ponto.rotulo,
                    valor: formatarPorcentagem(ponto.valor),
                  }))}
                  rowKey={(ponto) => ponto.chave}
                  densidade="compacta"
                  empty={{ titulo: 'Nenhum simulado nesse recorte' }}
                />
              }
            />
          ))}
        </GradeAutoAjuste>
      )}
    </Layout>
  )
}
