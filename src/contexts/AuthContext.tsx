import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { UserProfile, UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  role: UserRole
  isLoading: boolean
  isAdmin: boolean
  isStaff: boolean
  signIn: (email: string, password?: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
  switchDemoRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'u1000000-0000-0000-0000-000000000001',
  email: 'admin@ecotdev.com',
  full_name: 'Admin Quản Trị Viên',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  phone: '0988888999',
  is_banned: false,
  role: 'SUPER_ADMIN',
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ecotdev_active_profile')
    return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      if (!isSupabaseConfigured) {
        setIsLoading(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && mounted) {
          setUser(session.user)
          await fetchUserProfile(session.user.id, session.user.email || '')
        }
      } catch (err) {
        console.warn('Supabase Auth init error:', err)
      } finally {
        if (mounted) setIsLoading(false)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session: Session | null) => {
          if (!mounted) return
          if (session?.user) {
            setUser(session.user)
            await fetchUserProfile(session.user.id, session.user.email || '')
          } else {
            setUser(null)
            // Fallback to local profile in preview mode
            if (!isSupabaseConfigured) {
              setProfile(DEFAULT_DEMO_USER)
            } else {
              setProfile(null)
            }
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      const userProfile: UserProfile = {
        id: userId,
        email: email,
        full_name: profileData?.full_name || email.split('@')[0],
        avatar_url: profileData?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
        phone: profileData?.phone || '',
        is_banned: profileData?.is_banned || false,
        role: roleData?.role || 'CUSTOMER',
      }

      setProfile(userProfile)
      localStorage.setItem('ecotdev_active_profile', JSON.stringify(userProfile))
    } catch {
      // Keep existing profile
    }
  }

  const signIn = async (email: string, password?: string) => {
    if (!isSupabaseConfigured) {
      const isSuper = email.includes('admin')
      const mockProfile: UserProfile = {
        id: isSuper ? 'u1000000-0000-0000-0000-000000000001' : 'u2000000-0000-0000-0000-000000000002',
        email,
        full_name: isSuper ? 'Admin Quản Trị' : 'Nguyễn Văn Khách Hàng',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        phone: '0912345678',
        is_banned: false,
        role: isSuper ? 'SUPER_ADMIN' : 'CUSTOMER',
      }
      setProfile(mockProfile)
      localStorage.setItem('ecotdev_active_profile', JSON.stringify(mockProfile))
      return { error: null }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '12345678',
      })
      if (error) return { error }
      if (data.user) {
        setUser(data.user)
        await fetchUserProfile(data.user.id, data.user.email || '')
      }
      return { error: null }
    } catch (err: any) {
      return { error: err }
    }
  }

  const signUp = async (email: string, password?: string, fullName?: string) => {
    if (!isSupabaseConfigured) {
      const mockProfile: UserProfile = {
        id: `u-${Date.now()}`,
        email,
        full_name: fullName || email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        phone: '',
        is_banned: false,
        role: 'CUSTOMER',
      }
      setProfile(mockProfile)
      localStorage.setItem('ecotdev_active_profile', JSON.stringify(mockProfile))
      return { error: null }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || '12345678',
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      })
      if (error) return { error }
      if (data.user) {
        setUser(data.user)
        await fetchUserProfile(data.user.id, email)
      }
      return { error: null }
    } catch (err: any) {
      return { error: err }
    }
  }

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    localStorage.removeItem('ecotdev_active_profile')
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return false
    const updated = { ...profile, ...updates }
    setProfile(updated)
    localStorage.setItem('ecotdev_active_profile', JSON.stringify(updated))

    if (isSupabaseConfigured && profile.id) {
      await supabase
        .from('profiles')
        .update({
          full_name: updated.full_name,
          phone: updated.phone,
          avatar_url: updated.avatar_url,
        })
        .eq('id', profile.id)
    }
    return true
  }

  const switchDemoRole = (newRole: UserRole) => {
    if (!profile) return
    const updated = { ...profile, role: newRole }
    setProfile(updated)
    localStorage.setItem('ecotdev_active_profile', JSON.stringify(updated))
  }

  const role = profile?.role || 'CUSTOMER'
  const isSuperAdmin = role === 'SUPER_ADMIN'
  const isAdmin = isSuperAdmin || role === 'ADMIN'
  const isStaff = isAdmin || ['PRODUCT_MANAGER', 'ORDER_MANAGER', 'SUPPORT'].includes(role)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isAdmin,
        isStaff,
        signIn,
        signUp,
        signOut,
        updateProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
