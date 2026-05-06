import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const INITIAL_DEMO_USERS = [
  { email: 'admin@demo.com', password: 'Demo@1234', role: 'admin', name: 'Rajesh Sharma', id: 'ADM001' },
  { email: 'teacher1@demo.com', password: 'Demo@1234', role: 'teacher', name: 'Priya Menon', id: 'T001' },
  { email: 'teacher2@demo.com', password: 'Demo@1234', role: 'teacher', name: 'Arjun Verma', id: 'T002' },
  { email: 'student1@demo.com', password: 'Demo@1234', role: 'student', name: 'Aarav Patel', id: 'S001' },
  { email: 'student2@demo.com', password: 'Demo@1234', role: 'student', name: 'Sneha Iyer', id: 'S002' },
]

const REGISTERED_USERS_KEY = 'erp_registered_users'

const loadRegisteredUsers = () => {
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    if (!stored) return INITIAL_DEMO_USERS
    const additions = JSON.parse(stored)
    const existingEmails = new Set(INITIAL_DEMO_USERS.map((u) => u.email))
    const uniqueAdditions = additions.filter((u) => !existingEmails.has(u.email))
    return [...INITIAL_DEMO_USERS, ...uniqueAdditions]
  } catch {
    return INITIAL_DEMO_USERS
  }
}

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allUsers, setAllUsers] = useState(loadRegisteredUsers)

  useEffect(() => {
    const storedUser = localStorage.getItem('erp_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const registerUser = useCallback((userData) => {
    const newUser = {
      email: userData.email,
      password: userData.password || 'Demo@1234',
      role: userData.role,
      name: userData.name,
      id: userData.id,
    }

    setAllUsers((prev) => {
      const alreadyExists = prev.some((u) => u.email === newUser.email)
      if (alreadyExists) return prev
      const updated = [...prev, newUser]
      const originalEmails = new Set(INITIAL_DEMO_USERS.map((u) => u.email))
      const additions = updated.filter((u) => !originalEmails.has(u.email))
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(additions))
      return updated
    })

    return newUser
  }, [])

  const login = useCallback((email, password) => {
    const foundUser = allUsers.find(
      (demoUser) => demoUser.email === email && demoUser.password === password
    )

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' }
    }

    const userData = {
      email: foundUser.email,
      role: foundUser.role,
      name: foundUser.name,
      id: foundUser.id,
    }

    localStorage.setItem('erp_user', JSON.stringify(userData))
    setUser(userData)

    return { success: true, user: userData }
  }, [allUsers])

  const logout = useCallback(() => {
    localStorage.removeItem('erp_user')
    setUser(null)
  }, [])

  const getRoleRedirectPath = useCallback((role) => {
    const redirectMap = {
      admin: '/dashboard/admin',
      teacher: '/dashboard/teacher-portal',
      student: '/dashboard/student-portal',
    }
    return redirectMap[role] || '/dashboard/admin'
  }, [])

  const value = {
    user,
    isLoading,
    login,
    logout,
    registerUser,
    getRoleRedirectPath,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    demoUsers: INITIAL_DEMO_USERS,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return children
}
