/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateVPHistRequest {
  name: string
  purpose: string
  coordinateLat: string
  coordinateLng: string
}
