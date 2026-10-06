import { useState } from 'react'
import { FileDown, FileSpreadsheet, Maximize2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { exportarExcel } from '@/utils/exportacao/exportarPlanilha'
import { exportarPdfSecaoUnica } from '@/utils/exportacao/exportarPdf'
import { renderizarGraficoComoImagem } from '@/components/graficos/RenderizarGrafico'

import { SecaoDetalhe, SecaoContexto } from './styles'
import type { GraficoCardProps } from './types'

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

  // Cópia fora da tela, capturada como imagem para o relatório exportado.
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
            <Card elevacao="none" semPadding>
              {detalhe}
            </Card>
          </SecaoDetalhe>
        )}
      </Modal>
    </>
  )
}
