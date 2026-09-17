import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { BarChart3, MousePointerClick } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import type { Coluna } from '../../../components/ui/DataTable/types'
import { GraficoBarras } from '../../../components/ui/GraficoBarras'
import { GraficoCard } from '../../../components/ui/GraficoCard'
import { Header } from '../../../components/ui/Header'
import { Histograma } from '../../../components/ui/Histograma'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { alunos as servicoAlunos } from '../../../services/endpoints'
import { calcularFaixasHistograma, estaNaFaixaHistograma } from '../../../utils/desempenho'
import { formatarPorcentagem } from '../../../utils/format'
import { FiltrosDesempenho } from './FiltrosDesempenho'
import { ResumoFiltrosDesempenho } from './ResumoFiltrosDesempenho'
import { resumoFiltrosTexto } from './resumoFiltrosTexto'
import { useDesempenhoDados } from './useDesempenhoDados'

/* GraficoCard passa semPadding no card que envolve `detalhe` (a DataTable já
   tem sua própria margem interna) — conteúdo que não é tabela precisa do
   próprio espaçamento pra não colar nas bordas do card. */
const PreenchidoDetalhe = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`

/* Mesmo padding e borda do cabeçalho do Card. */
const CabecalhoDetalhe = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const TituloDetalhe = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

/** Versão filtrável do card "Visão geral" do painel de Desempenho. */
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
    filtrosAplicados,
    buscar,
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

  const colunasDetalheFaixa: Coluna<(typeof detalheFaixa)[number]>[] = [
    { key: 'aluno', cabecalho: 'Aluno', render: (item) => item.alunoNome },
    { key: 'simulado', cabecalho: 'Simulado', render: (item) => item.simuladoTitulo },
    {
      key: 'nota',
      cabecalho: 'Nota',
      alinhamento: 'right',
      render: (item) => formatarPorcentagem(item.percentual),
    },
  ]

  const tabelaDisciplina = useMemo(
    () =>
      desempenhoPorDisciplina.map((item) => ({
        chave: item.chave,
        rotulo: item.rotulo,
        valor: formatarPorcentagem(item.valor),
      })),
    [desempenhoPorDisciplina],
  )

  const colunasTabelaDisciplina: Coluna<(typeof tabelaDisciplina)[number]>[] = [
    { key: 'rotulo', cabecalho: 'Disciplina', render: (item) => item.rotulo },
    { key: 'valor', cabecalho: 'Desempenho médio', alinhamento: 'right', render: (item) => item.valor },
  ]

  // Valores exatos do histograma, exportados junto com o gráfico no PDF e no Excel.
  const tabelaDistribuicao = useMemo(
    () =>
      calcularFaixasHistograma(notasPercentuais).map((faixa) => ({
        chave: faixa.rotulo,
        rotulo: faixa.rotulo,
        valor: String(faixa.quantidade),
      })),
    [notasPercentuais],
  )

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
  // Mesmo recorte, em texto puro — vai no PDF exportado de cada gráfico
  // (que não sabe renderizar o ReactNode acima).
  const resumoFiltrosTextoAtual = resumoFiltrosTexto(recorteAplicado)

  return (
    <Layout>
      <Header
        titulo="Visão geral do desempenho"
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
      ) : notasPercentuais.length === 0 ? (
        <Card>
          <EstadoVazio
            titulo="Nada encontrado"
            descricao="Não há tentativas concluídas para os filtros selecionados."
            icon={<BarChart3 />}
          />
        </Card>
      ) : (
        <GradeAutoAjuste $larguraMinima="280px" $espaco="xl">
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
            contextoTexto={resumoFiltrosTextoAtual}
            dados={tabelaDistribuicao}
            colunaRotulo="Faixa de nota"
            colunaValor="Quantidade"
            detalhe={
              !faixaSelecionada ? (
                <PreenchidoDetalhe>
                  <EstadoVazio
                    titulo="Selecione uma coluna"
                    descricao="Clique numa coluna do gráfico acima pra ver quem está naquela faixa de nota."
                    icon={<MousePointerClick />}
                  />
                </PreenchidoDetalhe>
              ) : requisicaoAlunos.loading ? (
                <PreenchidoDetalhe>
                  <Skeleton $altura="120px" $raio="8px" />
                </PreenchidoDetalhe>
              ) : (
                <>
                  <CabecalhoDetalhe>
                    <TituloDetalhe>
                      Notas na faixa {faixaSelecionada} ({detalheFaixa.length})
                    </TituloDetalhe>
                  </CabecalhoDetalhe>
                  <DataTable
                    descricao={`Notas na faixa ${faixaSelecionada}`}
                    columns={colunasDetalheFaixa}
                    data={detalheFaixa}
                    rowKey={(item) => item.tentativaId}
                    densidade="compacta"
                    empty={{
                      titulo: 'Ninguém nessa faixa',
                      descricao: 'Nenhuma tentativa concluída caiu nesse intervalo.',
                    }}
                  />
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
            contextoTexto={resumoFiltrosTextoAtual}
            dados={tabelaDisciplina}
            colunaRotulo="Disciplina"
            colunaValor="Desempenho médio"
            detalhe={
              <DataTable
                descricao="Desempenho médio por disciplina"
                columns={colunasTabelaDisciplina}
                data={tabelaDisciplina}
                rowKey={(item) => item.chave}
                densidade="compacta"
                empty={{ titulo: 'Nenhuma disciplina com simulado concluído' }}
              />
            }
          />
        </GradeAutoAjuste>
      )}
    </Layout>
  )
}
