import styled from 'styled-components'

/* Mesmo padrão visual da tabela de "Desempenho por questão" do detalhamento
   de simulado (DetalheSimuladoModal) — reaproveitado aqui pra tabela de
   valores exatos por trás de um gráfico (GraficoCard), sem duplicar o CSS. */
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

export interface ItemTabelaResumo {
  chave: string
  rotulo: string
  /** Já formatado — cada tela decide se é porcentagem, contagem etc. */
  valor: string
}

interface TabelaResumoProps {
  colunaRotulo: string
  colunaValor: string
  itens: ItemTabelaResumo[]
}

/**
 * Tabela simples com os valores exatos por trás de um gráfico (GraficoBarras,
 * GraficoLinha, Histograma) — usada no modal de detalhamento dos gráficos do
 * módulo de Reforço (GraficoCard), complementando o gráfico com os números
 * que ele representa.
 */
export function TabelaResumo({ colunaRotulo, colunaValor, itens }: TabelaResumoProps) {
  return (
    <Tabela>
      <thead>
        <tr>
          <th>{colunaRotulo}</th>
          <th>{colunaValor}</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((item) => (
          <tr key={item.chave}>
            <td>{item.rotulo}</td>
            <td>{item.valor}</td>
          </tr>
        ))}
      </tbody>
    </Tabela>
  )
}
