export interface RequestState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface RequestResult<T> extends RequestState<T> {
  reload: () => Promise<void>
  setData: (updater: T | ((previous: T | null) => T | null)) => void
  isEmpty: boolean
}
