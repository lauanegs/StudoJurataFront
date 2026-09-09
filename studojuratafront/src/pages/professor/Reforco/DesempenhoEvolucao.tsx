import styled from 'styled-components'
import { TrendingUp } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Card } from '../../../components/ui/Card'
import { GraficoCard } from '../../../components/ui/GraficoCard'
import { GraficoLinha } from '../../../components/ui/GraficoLinha'
import { Header } from '../../../components/ui/Header'
import { TabelaResumo } from '../../../components/ui/TabelaResumo'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { formatarPorcentagem } from '../../../utils/format'
import { FiltrosDesempenho } from './FiltrosDesempenho'
import { ResumoFiltrosDesempenho } from './ResumoFiltrosDesempenho'
import { resumoFiltrosTexto } from './resumoFiltrosTexto'
import { useDesempenhoDados } from './useDesempenhoDados'

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`

/**
 * Detalhamento de "Evolução ao longo do tempo" — versão filtrável por
 * turma/disciplina/aluno/período do card de mesmo nome no Dashboard.
 * Filtrando por um aluno, cada linha passa a mostrar a evolução daquele
 * aluno especificamente (não mais a média da turma) — ver
 * useDesempenhoDados/tendenciaPorDisciplina.
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

  // Confirmado pelo usuário: o recorte aplicado (turma/disciplina/aluno/
  // período) não fica mais solto na tela — some só pro detalhamento de cada
  // gráfico, dentro do modal "Detalhar".
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
        <Grade>
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
                <TabelaResumo
                  colunaRotulo="Simulado"
                  colunaValor="Nota"
                  itens={item.pontos.map((ponto) => ({
                    chave: ponto.chave,
                    rotulo: ponto.rotulo,
                    valor: formatarPorcentagem(ponto.valor),
                  }))}
                />
              }
            />
          ))}
        </Grade>
      )}
    </Layout>
  )
}
