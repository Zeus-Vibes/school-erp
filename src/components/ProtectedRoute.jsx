import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated, isLoading, getRoleRedirectPath } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true })
      } else if (allowedRole && user?.role !== allowedRole) {
        navigate(getRoleRedirectPath(user?.role), { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRole, navigate, getRoleRedirectPath])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated || (allowedRole && user?.role !== allowedRole)) {
    return null
  }

  return children
}

export default ProtectedRoute
