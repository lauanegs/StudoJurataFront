import { useState, type ReactNode } from 'react'
import styled from 'styled-components'
import { FileDown, FileSpreadsheet, Maximize2 } from 'lucide-react'

import { Button } from '../Button'
import { Card } from '../Card'
import { Modal } from '../Modal'
import type { ItemTabelaResumo } from '../TabelaResumo'
import { exportarExcel } from '../../../utils/exportarPlanilha'
import { exportarPdfSecaoUnica } from '../../../utils/exportarPdf'
import { renderizarGraficoComoImagem } from '../../../utils/renderizarGrafico'

/* Confirmado pelo usuário: em vez de uma linha separando as seções do
   modal, cada uma vira seu próprio retângulo (Card elevacao="none" — borda
   cinza suave, raio padrão) — mesmo tratamento dado às seções do
   detalhamento de simulado (DetalheSimuladoModal). Também contém melhor o
   gráfico grande, que antes ficava "solto" no modal. */
const SecaoDetalhe = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`

/* Espaço entre o resumo dos filtros aplicados e o gráfico abaixo dele. */
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
  /** Mesmo recorte de `contexto`, como texto puro — vai no cabeçalho do PDF exportado (que não sabe renderizar o ReactNode de `contexto`). */
  contextoTexto?: string[]
  /** Conteúdo extra abaixo do gráfico — tabela de valores exatos, ou o detalhe de uma coluna clicada
   * (e o pedido pra selecionar uma, enquanto nada foi clicado). Mostrado só no modal de detalhamento, nunca no card compacto. */
  detalhe?: ReactNode
  /** Valores exatos por trás do gráfico — o que é exportado pro PDF e pro Excel. */
  dados: ItemTabelaResumo[]
  colunaRotulo?: string
  colunaValor?: string
  alturaCompacta?: number
  alturaDetalhe?: number
}

/**
 * Cada gráfico do painel de Reforço fica no seu próprio card branco (dentro
 * da seção maior de fundo transparente, mesmo padrão da Home) com um botão
 * "Detalhar" — abre o mesmo gráfico maior num modal, com as opções de
 * exportar os valores exatos em PDF (jsPDF) ou Excel (SheetJS) — geradas a
 * partir dos dados, não de uma captura da tela, que não imprimia de forma
 * confiável. Componente único pra não repetir essa mecânica em cada
 * gráfico (Histograma/GraficoBarras/GraficoLinha usam o mesmo).
 */
export function GraficoCard({
  titulo,
  descricao,
  renderGrafico,
  contexto,
  contextoTexto = [],
  detalhe,
  dados,
  colunaRotulo = 'Categoria',
  colunaValor = 'Valor',
  alturaCompacta = 220,
  alturaDetalhe = 320,
}: GraficoCardProps) {
  const [aberto, setAberto] = useState(false)

  // Renderiza o MESMO gráfico (renderGrafico, não interativo) fora da tela
  // pra capturar o desenho como imagem — vai embutido no relatório, além da
  // tabela de valores exatos que já ia.
  const capturarImagem = () => renderizarGraficoComoImagem(<>{renderGrafico(280, false)}</>, 640, 280)

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
          <>
            <Button
              variant="secondary"
              icon={<FileSpreadsheet />}
              onClick={async () => exportarExcel(titulo, colunaRotulo, colunaValor, dados, await capturarImagem())}
            >
              Exportar Excel
            </Button>
            <Button
              variant="secondary"
              icon={<FileDown />}
              onClick={async () =>
                exportarPdfSecaoUnica(titulo, titulo, contextoTexto, colunaRotulo, colunaValor, dados, await capturarImagem())
              }
            >
              Baixar PDF
            </Button>
          </>
        }
      >
        {contexto && <SecaoContexto>{contexto}</SecaoContexto>}
        <Card elevacao="none">{renderGrafico(alturaDetalhe, true)}</Card>
        {detalhe && (
          <SecaoDetalhe>
            <Card elevacao="none">{detalhe}</Card>
          </SecaoDetalhe>
        )}
      </Modal>
    </>
  )
}
