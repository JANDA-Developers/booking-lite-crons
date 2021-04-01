export interface OperationResult<T> {
  ok: boolean
  execId: string
  date: Date
  data?: T[]
}
