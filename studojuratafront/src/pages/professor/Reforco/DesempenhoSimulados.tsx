import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { BookOpen, FileText, TrendingUp, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Card } from '../../../components/ui/Card'
import { DesempenhoCard } from '../../../components/ui/DesempenhoCard'
import { Header } from '../../../components/ui/Header'
import { Tag } from '../../../components/ui/Tag'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { DetalheSimuladoModal } from './DetalheSimuladoModal'
import { FiltrosDesempenho } from './FiltrosDesempenho'
import { useDesempenhoDados, type DesempenhoSimulado } from './useDesempenhoDados'

/* Confirmado pelo usuário: aqui os cards são horizontais e um por linha
   (não a grade de 4 colunas do Dashboard) — cabem melhor os dados extras
   (turma, disciplina) sem espremer o card. */
const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Confirmado pelo usuário: no card, turma e disciplina viram tags com ícone
   — o texto "Turma: X"/"Disciplina: Y" por extenso fica só no modal de
   detalhamento (DetalheSimuladoModal). */
const InfoSimulado = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

/**
 * Detalhamento de "Desempenho por simulado" — versão filtrável por
 * turma/disciplina/aluno/período do card de mesmo nome no Dashboard. Clicar
 * num card abre o mesmo modal de detalhamento (DetalheSimuladoModal) já
 * usado lá, respeitando o aluno filtrado quando houver um selecionado.
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

  // Confirmado pelo usuário: o modal de detalhamento (DetalheSimuladoModal)
  // não recebe mais o resumo de filtros daqui — ele já mostra os próprios
  // dados do simulado (turma, disciplina, data, destinação); repetir o
  // recorte da tela por cima disso duplicava a mesma informação duas vezes.

  // Confirmado pelo usuário: aqui a ordem é por realização, mais recente
  // primeiro — diferente da ordem padrão de `desempenhos` (pior desempenho
  // primeiro, usada no Dashboard pra chamar atenção pros críticos). Sem data
  // (simulado sem dataInicio nem createdAt), o item fica no fim da lista.
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

      {loading ? (
        <Skeleton $altura="140px" $raio="8px" />
      ) : error ? (
        <Card>
          <ErroCarregamento mensagem={error} onRetry={reload} />
        </Card>
      ) : desempenhos.length === 0 ? (
        <Card>
          <EstadoVazio
            titulo="Nada encontrado"
            descricao="Não há simulados concluídos para os filtros selecionados."
            icon={<TrendingUp />}
          />
        </Card>
      ) : (
        <Lista>
          {desempenhosPorData.map((item) => (
            <DesempenhoCard
              key={item.simuladoId}
              titulo={item.titulo}
              descricao={
                <InfoSimulado>
                  <Tag variant="neutral" icon={<Users />}>
                    {item.turma}
                  </Tag>
                  <Tag variant="neutral" icon={<BookOpen />}>
                    {item.disciplina}
                  </Tag>
                </InfoSimulado>
              }
              porcentagem={item.percentual}
              icon={<FileText />}
              orientacao="horizontal"
              onClick={() => setSimuladoDetalhado(item)}
            />
          ))}
        </Lista>
      )}

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
