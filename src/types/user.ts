export type UserStatus = 'online' | 'offline' | 'away'

export interface User {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  status: UserStatus
  bio: string | null
  last_seen: string
  created_at: string
  updated_at: string
  is_verified: boolean
  is_blocked: boolean
  email: string
}