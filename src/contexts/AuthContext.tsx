import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User } from '../types/user'
import { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    metadata: { username: string; full_name: string }
  ) => Promise<{
    data: { user: SupabaseUser | null; session: Session | null } | null
    error: Error | null
  }>
  signOut: () => Promise<void>
  updateUserProfile: (userData: User) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    if (!supabaseUser?.id) return null

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', supabaseUser.id)
        .maybeSingle()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        return null
      }

      return profile as User | null
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }
  }

  const updateUserStatus = async (userId: string, isOnline: boolean) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          online_status: isOnline ? 'online' : 'offline',
          last_seen: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Erro ao atualizar status:', error)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    const setupUser = async (session: Session | null) => {
      if (!session?.user) {
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      const profile = await fetchUserProfile(session.user)
      
      if (mounted) {
        if (profile) {
          await updateUserStatus(session.user.id, true)
          setUser(profile)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setupUser(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setupUser(session)
    })

    return () => {
      mounted = false
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
        const profile = await fetchUserProfile(data.user)
        if (profile) {
          await updateUserStatus(data.user.id, true)
          setUser(profile)
        }
      }
    } catch (error) {
      throw error
    }
  }

  const signUp = async (
    email: string,
    password: string,
    metadata: { username: string; full_name: string }
  ) => {
    try {
      // 1. Verifica se o username já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', metadata.username.toLowerCase())
        .maybeSingle()

      if (checkError) {
        console.error('Erro ao verificar username:', checkError)
        throw new Error('Erro ao verificar disponibilidade do username')
      }

      if (existingUser) {
        throw new Error('Este nome de usuário já está em uso')
      }

      // 2. Tenta criar o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      })

      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado')
        }
        throw authError
      }

      if (!authData?.user) {
        throw new Error('Não foi possível criar o usuário')
      }

      // 3. Aguarda um pequeno intervalo para garantir que o Auth foi criado
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 4. Cria o perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: authData.user.id,
            username: metadata.username.toLowerCase(),
            full_name: metadata.full_name,
            email: email,
            online_status: 'offline',
            last_seen: new Date().toISOString(),
            avatar_url: null,
            status: 'active',
            bio: '',
            is_verified: false,
            is_blocked: false
          }
        ], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
        // Se falhar ao criar o perfil, tenta deletar o usuário do Auth
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Erro ao deletar usuário após falha no perfil:', deleteError)
        }
        throw new Error('Erro ao criar perfil do usuário')
      }

      return { data: authData, error: null }

    } catch (error) {
      console.error('Erro no signUp:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido ao criar usuário')
      }
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
        .update(userData)
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