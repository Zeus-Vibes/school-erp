import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import clsx from 'clsx'
import logoImg from '../../assets/images/logo.jpeg'

const spring = { type: 'spring', stiffness: 200, damping: 20 }

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Programs', href: '#programs' },
  { label: 'Facilities', href: '#facilities' },
  { label: 'Notices', href: '#notices' },
  { label: 'Contact', href: '#contact' },
]

const PublicNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring}
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Shree Bala Logo"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <div>
            <span
              className={clsx(
                'font-playfair text-base font-semibold leading-tight block transition-colors duration-300',
                isScrolled ? 'text-textPrimary' : 'text-white'
              )}
            >
              Shree Bala International
            </span>
            <span
              className={clsx(
                'text-[10px] tracking-wide transition-colors duration-300',
                isScrolled ? 'text-textMuted' : 'text-white/50'
              )}
            >
              Shiv Dhara Educational Charitable Trust
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={clsx(
                'text-[13px] font-medium transition-colors duration-200',
                isScrolled
                  ? 'text-textMuted hover:text-textPrimary'
                  : 'text-white/70 hover:text-white'
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <Link
            to="/login"
            className={clsx(
              'rounded-lg px-5 py-2 text-[13px] font-medium transition-all duration-200',
              isScrolled
                ? 'bg-textPrimary text-white hover:bg-textPrimary/90'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            )}
          >
            Login
          </Link>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={clsx(
            'lg:hidden p-2 rounded-lg transition-colors',
            isScrolled ? 'text-textPrimary' : 'text-white'
          )}
          aria-label="Toggle menu"
          tabIndex={0}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-white lg:hidden"
          >
            <div className="flex flex-col gap-0.5 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-textMuted hover:bg-section hover:text-textPrimary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 border-t border-border pt-3">
                <Link
                  to="/login"
                  className="block rounded-lg bg-textPrimary px-5 py-2.5 text-center text-sm font-medium text-white"
                >
                  Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default PublicNavbar
