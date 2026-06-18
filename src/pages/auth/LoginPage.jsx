import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import logoImg from '../../assets/images/logo.jpeg'
import heroImg from '../../assets/images/hero.jpeg'

const LoginPage = () => {
  const { login, getRoleRedirectPath } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('admin') // 'admin' | 'teacher' | 'student'
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shakeError, setShakeError] = useState(false)

  const demoCredentials = [
    { role: 'admin', label: 'Admin', icon: '🔴', userId: 'SBIS-ADMIN-001', password: 'Admin@123', color: 'text-highlight' },
    { role: 'teacher', label: 'Teacher', icon: '🟡', userId: 'SBIS-TCH-2425-001', password: 'Teacher@123', color: 'text-accent' },
    { role: 'student', label: 'Student', icon: '🟢', userId: 'SB-2425-3A-01', password: 'Student@123', color: 'text-secondary' }
  ]

  const handleRoleTabClick = (role) => {
    setSelectedRole(role)
    setError('')
  }

  const handleRoleTabKeyDown = (e, role) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleRoleTabClick(role)
    }
  }

  const handleAutoFill = (cred) => {
    setSelectedRole(cred.role)
    setUserId(cred.userId)
    setPassword(cred.password)
    setError('')
  }

  const handleAutoFillKeyDown = (e, cred) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleAutoFill(cred)
    }
  }

  const handleUserIdChange = (e) => {
    setUserId(e.target.value)
    setError('')
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setError('')
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleTogglePasswordKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTogglePassword()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    
    if (!userId.trim()) {
      setError('User ID is required')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }

    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const result = login(userId.trim(), selectedRole, password)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error)
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }

    toast.success(`Welcome, ${result.user.name}!`)
    navigate(getRoleRedirectPath(result.user.role), { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i} 
            animate={{ y: [0, -30, 0], x: [0, 15, 0] }} 
            transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full bg-accent/10 blur-2xl" 
            style={{ width: 80 + i * 40, height: 80 + i * 40, top: `${20 + i * 25}%`, left: `${10 + i * 20}%` }} 
          />
        ))}
      </div>

      <div className="hidden w-[45%] bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center relative overflow-hidden">
        <img src={heroImg} alt="School" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/80 to-primary/90" />
        <div className="relative z-10 text-center px-12">
          <img src={logoImg} alt="Shree Bala Logo" className="mx-auto mb-6 h-20 w-20 rounded-2xl object-cover shadow-lg" />
          <h2 className="font-playfair text-3xl font-bold text-white">Shree Bala International School</h2>
          <p className="mt-1 text-xs font-medium text-white/50 tracking-wide">Shiv Dhara Educational Charitable Trust</p>
          <p className="mt-3 text-sm text-white/70">Shaping Tomorrow&apos;s Leaders Since 2014</p>
          <div className="mt-12 flex items-center justify-center gap-6">
            {[{ val: '1200+', label: 'Students' }, { val: '10+', label: 'Years' }, { val: '50+', label: 'Teachers' }].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-accent">{val}</p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="w-full max-w-md relative z-10"
        >
          <img src={logoImg} alt="Shree Bala Logo" className="mx-auto mb-6 h-16 w-16 rounded-2xl object-cover shadow-lg lg:hidden" />
          <h1 className="text-center font-playfair text-2xl font-bold text-textPrimary">School Portal Login</h1>
          <p className="mt-1 text-center text-sm text-textMuted">Select your role and enter your User ID</p>

          {/* Role selector tabs */}
          <div className="mt-6 flex bg-section p-1 rounded-xl border border-border">
            {['admin', 'teacher', 'student'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleTabClick(role)}
                onKeyDown={(e) => handleRoleTabKeyDown(e, role)}
                tabIndex={0}
                aria-label={`Select ${role} role`}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  selectedRole === role 
                    ? 'bg-primary text-white shadow-button' 
                    : 'text-textMuted hover:text-textPrimary hover:bg-white/5'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <motion.form 
            onSubmit={handleSubmit} 
            animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}} 
            transition={{ duration: 0.4 }} 
            className="mt-6 space-y-4"
          >
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
              <input 
                type="text" 
                value={userId} 
                onChange={handleUserIdChange} 
                placeholder="User ID (e.g. SBIS-ADMIN-001)" 
                className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-section text-textPrimary ${error ? 'border-highlight' : 'border-border'}`} 
                aria-label="User ID" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={handlePasswordChange} 
                placeholder="Password" 
                className={`w-full rounded-xl border py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-section text-textPrimary ${error ? 'border-highlight' : 'border-border'}`} 
                aria-label="Password" 
              />
              <button 
                type="button" 
                onClick={handleTogglePassword} 
                onKeyDown={handleTogglePasswordKeyDown}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary cursor-pointer" 
                aria-label="Toggle password visibility" 
                tabIndex={0}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && <p className="text-xs text-highlight font-medium">{error}</p>}

            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              type="submit" 
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-button hover:bg-primary/90 disabled:opacity-70 transition-all cursor-pointer mt-4" 
              tabIndex={0} 
              aria-label="Sign In"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-textMuted">or use demo credentials</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-4 rounded-xl bg-section p-4 space-y-2.5 border border-border">
            {demoCredentials.map((cred) => (
              <button 
                key={cred.role} 
                onClick={() => handleAutoFill(cred)}
                onKeyDown={(e) => handleAutoFillKeyDown(e, cred)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer" 
                tabIndex={0} 
                aria-label={`Use ${cred.label} credentials`}
              >
                <span className="text-lg">{cred.icon}</span>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${cred.color}`}>{cred.label}</p>
                  <p className="text-xs text-textMuted">{cred.userId}</p>
                </div>
                <Copy className="h-3.5 w-3.5 text-textMuted" />
              </button>
            ))}
          </div>

          <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-textMuted hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Website
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
