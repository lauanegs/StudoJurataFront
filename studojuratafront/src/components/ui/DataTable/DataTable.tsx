import * as S from './styles'
import type { DataTableProps } from './types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function DataTable<T>({ columns, data, renderActions }: DataTableProps<T>) {
  return (
    <S.Container>
      <S.Table>
        <S.THead>
          <S.Tr>
            {columns.map((col, index) => (
              <S.Th key={index} style={{ width: col.width }}>
                {col.header}
              </S.Th>
            ))}
          </S.Tr>
        </S.THead>
        
        <tbody>
          {data.map((item, rowIndex) => (
            <S.Tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <S.Td key={colIndex}>
                  {col.accessor === 'actions' && renderActions
                    ? renderActions(item)
                    : (item[col.accessor as keyof T] as React.ReactNode)}
                </S.Td>
              ))}
            </S.Tr>
          ))}
        </tbody>
      </S.Table>

      <S.Pagination>
        <S.PageButton><ChevronLeft size={18} color='#4b4b4b' /></S.PageButton>
        <span>1 - 20 de 36</span>
        <S.PageButton><ChevronRight size={18} color='#4b4b4b' /></S.PageButton>
      </S.Pagination>
    </S.Container>
  )
}