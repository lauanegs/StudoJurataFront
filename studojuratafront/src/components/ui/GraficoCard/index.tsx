import { useState, type ReactNode } from 'react'
import styled from 'styled-components'
import { Maximize2, Printer } from 'lucide-react'

import { Button } from '../Button'
import { Card } from '../Card'
import { Modal } from '../Modal'
import { imprimirRelatorio } from '../../../utils/imprimir'

/* Separa o detalhamento (tabela de valores, ou o detalhe de uma coluna
   clicada) do gráfico acima dele — mesmo padrão de divisor entre seções
   usado no detalhamento de simulado (DetalheSimuladoModal). */
const SecaoDetalhe = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

/* Espaço entre o resumo dos filtros aplicados e o gráfico abaixo dele —
   mesmo tratamento do EnvolveContexto do DetalheSimuladoModal. */
const SecaoContexto = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

interface GraficoCardProps {
  titulo: string
  /** Descrição opcional mostrada só no modal de detalhamento (o card compacto não tem espaço pra ela). */
  descricao?: string
  /** Recebe a altura (px) a usar e se é a versão interativa (dentro do modal) — o mesmo gráfico é
   * renderizado compacto (não interativo) no card e maior (interativo) no modal. Interações como
   * clicar numa coluna pra detalhar só devem ficar ativas quando `interativo` for true. */
  renderGrafico: (altura: number, interativo: boolean) => ReactNode
  /** Resumo do recorte aplicado (turma/disciplina/aluno/período) — mostrado só no modal de detalhamento, antes do gráfico. */
  contexto?: ReactNode
  /** Conteúdo extra abaixo do gráfico — tabela de valores exatos, ou o detalhe de uma coluna clicada
   * (e o pedido pra selecionar uma, enquanto nada foi clicado). Mostrado só no modal de detalhamento, nunca no card compacto. */
  detalhe?: ReactNode
  alturaCompacta?: number
  alturaDetalhe?: number
}

/**
 * Cada gráfico do painel de Reforço fica no seu próprio card branco (dentro
 * da seção maior de fundo transparente, mesmo padrão da Home) com um botão
 * "Detalhar" — abre o mesmo gráfico maior num modal, com a opção de
 * imprimir. Componente único pra não repetir essa mecânica em cada gráfico
 * (Histograma/GraficoBarras/GraficoLinha usam o mesmo).
 */
export function GraficoCard({
  titulo,
  descricao,
  renderGrafico,
  contexto,
  detalhe,
  alturaCompacta = 220,
  alturaDetalhe = 380,
}: GraficoCardProps) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Card
        titulo={titulo}
        actions={
          <Button
            variant="subtle"
            size="small"
            icon={<Maximize2 />}
            onClick={() => setAberto(true)}
          >
            Detalhar
          </Button>
        }
      >
        {renderGrafico(alturaCompacta, false)}
      </Card>

      <Modal
        aberto={aberto}
        onClose={() => setAberto(false)}
        titulo={titulo}
        descricao={descricao}
        largura="760px"
        rodape={
          <Button variant="secondary" icon={<Printer />} onClick={imprimirRelatorio}>
            Imprimir
          </Button>
        }
      >
        <div className="area-impressao">
          {contexto && <SecaoContexto>{contexto}</SecaoContexto>}
          {renderGrafico(alturaDetalhe, true)}
          {detalhe && <SecaoDetalhe>{detalhe}</SecaoDetalhe>}
        </div>
      </Modal>
    </>
  )
}
