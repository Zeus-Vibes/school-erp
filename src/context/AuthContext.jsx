import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { mockUsers } from '../data/mockUsers'

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

  useEffect(() => {
    const storedUser = localStorage.getItem('erp_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((userId, role, password) => {
    // Match userId + role from mockUsers array — any password works
    const foundUser = mockUsers.find(
      (u) => u.userId === userId && u.role === role
    )

    if (!foundUser) {
      return { success: false, error: 'Invalid User ID or Role' }
    }

    const userData = {
      userId: foundUser.userId,
      role: foundUser.role,
      name: foundUser.name
    }

    localStorage.setItem('erp_user', JSON.stringify(userData))
    setUser(userData)

    return { success: true, user: userData }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('erp_user')
    setUser(null)
  }, [])

  const getRoleRedirectPath = useCallback((role) => {
    const redirectMap = {
      admin: '/dashboard/admin',
      teacher: '/dashboard/teacher',
      student: '/dashboard/student'
    }
    return redirectMap[role] || '/dashboard/admin'
  }, [])

  const value = {
    user,
    isLoading,
    login,
    logout,
    getRoleRedirectPath,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    mockUsers
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
