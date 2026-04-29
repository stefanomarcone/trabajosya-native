import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '../types'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  appUser: User | null
  loading: boolean
  activeMode: 'worker' | 'employer'
  toggleMode: () => void
  register: (email: string, password: string, displayName: string, phone?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [appUser, setAppUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMode, setActiveMode] = useState<'worker' | 'employer'>('worker')

  useEffect(() => {
    AsyncStorage.getItem('activeMode').then((val) => {
      if (val === 'worker' || val === 'employer') setActiveMode(val)
    })
  }, [])

  function toggleMode() {
    setActiveMode((prev) => {
      const next = prev === 'worker' ? 'employer' : 'worker'
      AsyncStorage.setItem('activeMode', next)
      return next
    })
  }

  async function loadAppUser(uid: string) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      setAppUser({ id: snap.id, ...(snap.data() as Omit<User, 'id'>) })
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        await loadAppUser(user.uid)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function register(email: string, password: string, displayName: string, phone?: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const userData: Omit<User, 'id'> = {
      display_name: displayName,
      email,
      role: 'worker',
      id_status: 'pending',
      verified_criminal_record: false,
      tools_available: [],
      rating_map: {},
      employer_rating: { avg: 0, count: 0, dimensions: { payment: 0, clarity: 0, treatment: 0 } },
      created_at: new Date().toISOString(),
      ...(phone ? { phone } : {}),
      terms_accepted_at: new Date().toISOString(),
    }
    await setDoc(doc(db, 'users', cred.user.uid), { ...userData, created_at: serverTimestamp() })
    setAppUser({ id: cred.user.uid, ...userData })
    await sendEmailVerification(cred.user)
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
    setAppUser(null)
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email)
  }

  async function refreshUser() {
    if (firebaseUser) await loadAppUser(firebaseUser.uid)
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, activeMode, toggleMode, register, login, logout, resetPassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
