export type AuthProvider = 'email' | 'phone' | 'google' | 'facebook'
export type UserRole = 'user' | 'admin'

export interface Account {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  provider: AuthProvider
  role: UserRole
  avatar?: string | null
  isPlus: boolean
  plusUntil?: string | null
  coins: number
  xp: number
  level: number
  streak: number
  equippedFrame: string | null
  equippedPet: string | null
  equippedBg: string | null
  goal?: string | null
  refCount?: number
  emailVerified?: boolean
  emailOptout?: boolean
}

export interface Session {
  token: string
  user: Account
}
