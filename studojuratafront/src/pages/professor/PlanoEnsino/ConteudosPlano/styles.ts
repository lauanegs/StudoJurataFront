import styled from 'styled-components'
import { CamposFiltro } from '@/components/ui/Header'

/* flex-shrink:0 nos botões para o texto não cortar quando a linha aperta. */
export const CamposCabecalho = styled(CamposFiltro)`
  > button {
    flex-shrink: 0;
  }
`

export const TextoLimitado = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export const DatasMinistradas = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`

export const ListaImportaveis = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
