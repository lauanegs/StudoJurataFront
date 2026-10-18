import { TrendingUp } from 'lucide-react'

import { Layout } from '@/components/layout'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import type { Coluna } from '@/components/ui/DataTable/types'
import { GraficoCard } from '@/components/graficos/GraficoCard'
import { GraficoLinha } from '@/components/graficos/GraficoLinha'
import { Header } from '@/components/ui/Header'
import { GradeAutoAjuste } from '@/components/ui/GradeAutoAjuste'
import { EstadoVazio } from '@/components/feedback/EstadoVazio'
import { ErroCarregamento } from '@/components/feedback/ErroCarregamento'
import { Skeleton } from '@/components/feedback/Skeleton'
import { formatarPorcentagem } from '@/utils/format'
import { FiltrosDesempenho } from '@/pages/professor/Reforco/comum/FiltrosDesempenho/FiltrosDesempenho'
import { ResumoFiltrosDesempenho } from '@/pages/professor/Reforco/comum/ResumoFiltrosDesempenho/ResumoFiltrosDesempenho'
import { useDesempenhoDados } from '@/pages/professor/Reforco/comum/useDesempenhoDados'

import type { PontoTabela } from './types'

const colunasPontos: Coluna<PontoTabela>[] = [
  { key: 'rotulo', cabecalho: 'Simulado', render: (item) => item.rotulo },
  { key: 'valor', cabecalho: 'Nota', alinhamento: 'right', render: (item) => item.valor },
]

/** Versão filtrável do card "Evolução ao longo do tempo" do painel de Desempenho */
export default function DesempenhoEvolucao() {
  const {
    propsFiltros,
    recorteAplicado,
    resumoFiltrosTextoAtual,
    tendenciaPorDisciplina,
    loading,
    error,
    reload,
  } = useDesempenhoDados()

  const resumoFiltros = <ResumoFiltrosDesempenho {...recorteAplicado} />

  return (
    <Layout>
      <Header
        titulo="Evolução do desempenho"
        voltarPara="/professor/desempenho"
        rotuloVoltar="Desempenho"
        filtros={
          <FiltrosDesempenho {...propsFiltros} />
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
