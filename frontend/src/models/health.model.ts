export interface HealthCheck {
  name: string
  ok: boolean
  detail: string
  hint?: string
  optional?: boolean
}
