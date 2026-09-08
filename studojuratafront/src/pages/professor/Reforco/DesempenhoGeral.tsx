import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { BarChart3, MousePointerClick } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Card } from '../../../components/ui/Card'
import { GraficoBarras } from '../../../components/ui/GraficoBarras'
import { GraficoCard } from '../../../components/ui/GraficoCard'
import { Header } from '../../../components/ui/Header'
import { Histograma } from '../../../components/ui/Histograma'
import { TabelaResumo } from '../../../components/ui/TabelaResumo'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { alunos as servicoAlunos } from '../../../services/endpoints'
import { estaNaFaixaHistograma } from '../../../utils/desempenho'
import { formatarPorcentagem } from '../../../utils/format'
import { FiltrosDesempenho } from './FiltrosDesempenho'
import { ResumoFiltrosDesempenho } from './ResumoFiltrosDesempenho'
import { useDesempenhoDados } from './useDesempenhoDados'

/* Mesmo padrão do Dashboard (Dashboard.tsx): duas colunas lado a lado em
   telas largas, empilhando em telas estreitas. */
const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`

const TituloDetalhe = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    text-align: left;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    color: ${({ theme }) => theme.colors.textTertiary};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }

  td {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  th:last-child,
  td:last-child {
    text-align: right;
  }
`

/**
 * Detalhamento de "Visão geral" (distribuição geral de notas + desempenho
 * médio por disciplina) — versão filtrável por turma/disciplina/aluno/
 * período do card de mesmo nome no Dashboard, aberta pelo botão "Ver
 * detalhes" de lá.
 */
export default function DesempenhoGeral() {
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
    limparFiltros,
    opcoesTurmas,
    opcoesDisciplinas,
    opcoesAlunos,
    carregandoAlunos,
    carregandoVinculos,
    notasPercentuais,
    notasDetalhadas,
    desempenhoPorDisciplina,
    loading,
    error,
    reload,
  } = useDesempenhoDados()

  // Faixa clicada no histograma de distribuição — mostra, logo abaixo do
  // gráfico (dentro do modal "Detalhar"), quem está nela: aluno, simulado e
  // nota. Sem faixa selecionada, um aviso pede pra clicar numa coluna.
  const [faixaSelecionada, setFaixaSelecionada] = useState<string | null>(null)
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])

  const detalheFaixa = useMemo(() => {
    if (!faixaSelecionada) return []
    const mapaAlunos = new Map((requisicaoAlunos.data ?? []).map((aluno) => [aluno.id, aluno]))

    return notasDetalhadas
      .filter((item) => estaNaFaixaHistograma(item.percentual, faixaSelecionada))
      .map((item) => ({
        ...item,
        alunoNome: mapaAlunos.get(item.alunoId)?.pessoa?.nome ?? `Aluno ${item.alunoId}`,
      }))
      .sort((a, b) => a.alunoNome.localeCompare(b.alunoNome))
  }, [faixaSelecionada, notasDetalhadas, requisicaoAlunos.data])

  const tabelaDisciplina = useMemo(
    () =>
      desempenhoPorDisciplina.map((item) => ({
        chave: item.chave,
        rotulo: item.rotulo,
        valor: formatarPorcentagem(item.valor),
      })),
    [desempenhoPorDisciplina],
  )

  // Confirmado pelo usuário: o recorte aplicado (turma/disciplina/aluno/
  // período) não fica mais solto na tela — some só pro detalhamento de cada
  // gráfico, dentro do modal "Detalhar" (mesmo padrão do contexto já exibido
  // no modal de "Desempenho por simulado").
  const resumoFiltros = (
    <ResumoFiltrosDesempenho
      opcoesTurmas={opcoesTurmas}
      opcoesDisciplinas={opcoesDisciplinas}
      opcoesAlunos={opcoesAlunos}
      turmaId={turmaId}
      disciplinaId={disciplinaId}
      alunoId={alunoId}
      dataInicio={dataInicio}
      dataFim={dataFim}
    />
  )

  return (
    <Layout>
      <Header
        titulo="Visão geral do desempenho"
        voltarPara="/professor/reforco"
        rotuloVoltar="Módulo de reforço"
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
      ) : notasPercentuais.length === 0 ? (
        <Card>
          <EstadoVazio
            titulo="Nada encontrado"
            descricao="Não há tentativas concluídas para os filtros selecionados."
            icon={<BarChart3 />}
          />
        </Card>
      ) : (
        <Grade>
          <GraficoCard
            titulo="Distribuição geral das notas"
            descricao="Todas as tentativas concluídas dos simulados considerados, agrupadas em faixas de 20 pontos. Clique numa coluna pra ver quem está nela."
            renderGrafico={(altura, interativo) => (
              <Histograma
                valores={notasPercentuais}
                altura={altura}
                rotuloAcessivel="Distribuição geral de notas"
                onFaixaClick={interativo ? setFaixaSelecionada : undefined}
                faixaSelecionada={interativo ? faixaSelecionada : null}
              />
            )}
            contexto={resumoFiltros}
            detalhe={
              !faixaSelecionada ? (
                <EstadoVazio
                  titulo="Selecione uma coluna"
                  descricao="Clique numa coluna do gráfico acima pra ver quem está naquela faixa de nota."
                  icon={<MousePointerClick />}
                />
              ) : requisicaoAlunos.loading ? (
                <Skeleton $altura="120px" $raio="8px" />
              ) : (
                <>
                  <TituloDetalhe>
                    Notas na faixa {faixaSelecionada} ({detalheFaixa.length})
                  </TituloDetalhe>
                  {detalheFaixa.length === 0 ? (
                    <EstadoVazio
                      titulo="Ninguém nessa faixa"
                      descricao="Nenhuma tentativa concluída caiu nesse intervalo."
                    />
                  ) : (
                    <Tabela>
                      <thead>
                        <tr>
                          <th>Aluno</th>
                          <th>Simulado</th>
                          <th>Nota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalheFaixa.map((item) => (
                          <tr key={item.tentativaId}>
                            <td>{item.alunoNome}</td>
                            <td>{item.simuladoTitulo}</td>
                            <td>{formatarPorcentagem(item.percentual)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Tabela>
                  )}
                </>
              )
            }
          />

          <GraficoCard
            titulo="Desempenho médio por disciplina"
            descricao="Média do desempenho em cada disciplina, considerando os simulados concluídos filtrados."
            renderGrafico={(altura) => (
              <GraficoBarras
                itens={desempenhoPorDisciplina}
                altura={altura}
                rotuloAcessivel="Desempenho médio por disciplina"
              />
            )}
            contexto={resumoFiltros}
            detalhe={<TabelaResumo colunaRotulo="Disciplina" colunaValor="Desempenho médio" itens={tabelaDisciplina} />}
          />
        </Grade>
      )}
    </Layout>
  )
}
