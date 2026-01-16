import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UserType = 'customer' | 'middelbare-school'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  type?: UserType
  schoolName?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  userType: UserType | null
  login: (email: string, password: string, userType?: UserType) => Promise<boolean>
  loginMiddelbareSchool: (email: string, password: string, schoolName: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      userType: null,
      login: async (email: string, password: string, userType: UserType = 'customer') => {
        // Dummy login - accept any credentials
        // In a real app, this would make an API call
        const user: User = {
          id: '1',
          email: email || 'demo@bloemenvandegier.nl',
          name: email ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Demo Gebruiker',
          phone: '+31 6 12345678',
          type: userType,
        }
        set({ user, isAuthenticated: true, userType })
        return true
      },
      loginMiddelbareSchool: async (email: string, password: string, schoolName: string) => {
        // Special login for middelbare scholen
        const user: User = {
          id: `middelbare-school-${Date.now()}`,
          email: email,
          name: schoolName,
          type: 'middelbare-school',
          schoolName: schoolName,
        }
        set({ user, isAuthenticated: true, userType: 'middelbare-school' })
        return true
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, userType: null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
    }
  )
)
