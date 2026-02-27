export interface Column<T> {
  header: string
  accessor: keyof T | 'actions'
  width?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  renderActions?: (item: T) => React.ReactNode
}