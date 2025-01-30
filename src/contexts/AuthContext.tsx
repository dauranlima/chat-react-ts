import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, supabaseAdmin } from '../lib/supabase'
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

  const signUp = async (
    email: string,
    password: string,
    metadata: { username: string; full_name: string }
  ) => {
    try {
      // 1. Criar usuário no Auth
      console.log('Iniciando processo de registro...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      })

      if (authError) {
        console.error('Erro na criação do usuário:', authError)
        if (authError.message === 'email rate limit exceeded') {
          throw new Error('Muitas tentativas de registro. Por favor, aguarde alguns minutos antes de tentar novamente.')
        }
        throw authError
      }

      if (!authData.user) {
        console.error('Usuário não foi criado no Auth')
        throw new Error('Não foi possível criar o usuário')
      }

      console.log('Usuário criado com sucesso no Auth:', authData.user.id)

      // 2. Criar perfil do usuário usando o supabaseAdmin
      const newProfile = {
        id: authData.user.id,
        username: metadata.username,
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

      console.log('Tentando criar perfil:', newProfile)

      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([newProfile])
        .select()

      if (profileError) {
        console.error('Erro na criação do perfil:', profileError)
        
        // Tenta deletar o usuário do Auth se falhar ao criar o perfil
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Erro ao deletar usuário após falha no perfil:', deleteError)
        }

        throw new Error(`Erro ao criar perfil do usuário: ${profileError.message}`)
      }

      console.log('Perfil criado com sucesso:', profileData)
      return { data: authData, error: null }

    } catch (error) {
      console.error('Erro completo no signUp:', error)
      if (error instanceof Error) {
        // Tratamento específico para o erro de limite de email
        if (error.message.includes('email rate limit exceeded')) {
          return { 
            data: null, 
            error: new Error('Muitas tentativas de registro. Por favor, aguarde alguns minutos antes de tentar novamente.')
          }
        }
        return { 
          data: null, 
          error: new Error(error.message || 'Erro ao criar usuário')
        }
      }
      return { 
        data: null, 
        error: new Error('Erro desconhecido ao criar usuário')
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