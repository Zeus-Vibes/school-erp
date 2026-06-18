import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import logoImg from '../../assets/images/logo.jpeg'

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Facilities', href: '#facilities' },
  { label: 'Programs', href: '#programs' },
  { label: 'Contact', href: '#contact' },
]

const PORTAL_LINKS = [
  { label: 'Student Login', to: '/login' },
  { label: 'Teacher Login', to: '/login' },
  { label: 'Admin Login', to: '/login' },
]

const Footer = () => (
  <footer className="bg-[#18181B] text-[#A1A1AA]">
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-5">
            <img
              src={logoImg}
              alt="Shree Bala Logo"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <div>
              <span className="font-playfair text-base font-semibold text-white block leading-tight">
                Shree Bala International
              </span>
              <span className="text-[10px] text-[#71717A]">
                Shiv Dhara Educational Charitable Trust
              </span>
            </div>
          </Link>
          <p className="text-sm leading-relaxed text-[#71717A]">
            Shaping tomorrow&apos;s leaders through excellence in education
            since 2014.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-5 text-xs font-medium uppercase tracking-[0.15em] text-[#71717A]">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-[#A1A1AA] transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Portal */}
        <div>
          <h4 className="mb-5 text-xs font-medium uppercase tracking-[0.15em] text-[#71717A]">
            ERP Portal
          </h4>
          <ul className="space-y-3">
            {PORTAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-[#A1A1AA] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-5 text-xs font-medium uppercase tracking-[0.15em] text-[#71717A]">
            Contact
          </h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#71717A]" />
              <span>Near Suramya Heights, Eklingji Bopal Road, Sanand - Ahmedabad</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-[#71717A]" />
              <span>+91 84888 87896</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 shrink-0 text-[#71717A]" />
              <span>shreebalainternationalschool@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div className="border-t border-[#27272A]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 sm:flex-row">
        <p className="text-xs text-[#52525B]">
          © 2024 Shree Bala International School. All rights reserved.
        </p>
        <p className="text-xs text-[#52525B]">
          Shiv Dhara Educational Charitable Trust
        </p>
      </div>
    </div>
  </footer>
)

export default Footer
