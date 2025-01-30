export interface User {
  id: string
  username: string
  full_name: string
  email: string
  avatar_url: string | null
  online_status: 'online' | 'offline'
  last_seen: string
  status: 'active' | 'inactive' | 'blocked'
  bio?: string
  created_at?: string
  updated_at?: string
  is_verified?: boolean
  is_blocked?: boolean
}