import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User } from '../types/user'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: (userData: User) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error) throw error

      return profile as User
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }
  }

  const updateUserStatus = async (userId: string, isOnline: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ online_status: isOnline ? 'online' : 'offline', last_seen: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  useEffect(() => {
    const setupUser = async (session: { user: SupabaseUser } | null) => {
      if (session?.user) {
        await updateUserStatus(session.user.id, true)
        const profile = await fetchUserProfile(session.user)
        setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    // Verifica a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setupUser(session)
    })

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setupUser(session)
    })

    // Cleanup na desmontagem do componente
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        await updateUserStatus(data.user.id, true)
        const profile = await fetchUserProfile(data.user)
        setUser(profile)
      }
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })

      if (error) throw error

      if (data.user) {
        const newProfile: User = {
          id: data.user.id,
          username: userData.username,
          full_name: userData.full_name,
          email: email,
          online_status: 'online' as const,
          last_seen: new Date().toISOString(),
          avatar_url: null,
          status: 'active' as const,
          bio: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_verified: false,
          is_blocked: false
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([newProfile])

        if (profileError) throw profileError

        setUser(newProfile)
      }
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      if (user) {
        await updateUserStatus(user.id, false)
      }
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
    } catch (error) {
      throw error
    }
  }

  const updateUserProfile = async (userData: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: userData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)

      if (error) throw error

      setUser(userData)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}