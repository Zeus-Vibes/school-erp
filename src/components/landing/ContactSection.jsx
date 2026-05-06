import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const spring = { type: 'spring', stiffness: 200, damping: 20 }
const initialForm = { name: '', email: '', phone: '', subject: 'Admission Enquiry', message: '' }

const contactInfo = [
  { icon: MapPin, label: 'Address', text: 'Near Suramya Heights, Eklingji Bopal Road, Sanand - Ahmedabad' },
  { icon: Phone, label: 'Phone', text: '+91 84888 87896' },
  { icon: Mail, label: 'Email', text: 'shreebalainternationalschool@gmail.com' },
  { icon: Clock, label: 'Hours', text: 'Mon–Sat: 7:30 AM – 2:30 PM' },
]

const ContactSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.message.trim()) newErrors.message = 'Message is required'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    toast.success("Message sent! We'll get back to you soon.")
    setForm(initialForm)
  }

  const inputClasses = (hasError) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted/50 focus:outline-none focus:ring-2 focus:ring-textPrimary/10 transition-shadow ${hasError ? 'border-highlight' : 'border-border'}`

  return (
    <section id="contact" ref={ref} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={spring}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-textMuted">
              Contact
            </p>
            <h2 className="mb-4 font-playfair text-4xl font-semibold text-textPrimary md:text-5xl">
              Get in Touch
            </h2>
            <p className="mb-10 text-[15px] text-textMuted">
              Have questions about admissions or our programs? We&apos;d love to hear from you.
            </p>

            <div className="space-y-6">
              {contactInfo.map(({ icon: Icon, label, text }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ ...spring, delay: 0.1 + index * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-section">
                    <Icon className="h-4 w-4 text-textPrimary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-textMuted">{label}</p>
                    <p className="mt-0.5 text-sm text-textPrimary">{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...spring, delay: 0.15 }}
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-white p-8"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div className="space-y-4">
                <div>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your Name *"
                    className={inputClasses(errors.name)}
                  />
                  {errors.name && <p className="mt-1 text-xs text-highlight">{errors.name}</p>}
                </div>
                <div>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email Address *"
                    className={inputClasses(errors.email)}
                  />
                  {errors.email && <p className="mt-1 text-xs text-highlight">{errors.email}</p>}
                </div>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone (optional)"
                  className={inputClasses(false)}
                />
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className={inputClasses(false)}
                >
                  <option>Admission Enquiry</option>
                  <option>Fee Query</option>
                  <option>General</option>
                  <option>Other</option>
                </select>
                <div>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Your Message *"
                    className={`${inputClasses(errors.message)} resize-none`}
                  />
                  {errors.message && <p className="mt-1 text-xs text-highlight">{errors.message}</p>}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={spring}
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-textPrimary py-3.5 text-sm font-medium text-white transition-colors hover:bg-textPrimary/90"
                tabIndex={0}
                aria-label="Send Message"
              >
                Send Message
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
