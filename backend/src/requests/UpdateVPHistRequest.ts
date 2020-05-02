/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateVPHistRequest {
  name: string
  dueDate: string
  done: boolean
}