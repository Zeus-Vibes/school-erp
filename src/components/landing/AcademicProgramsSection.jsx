import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Smile, BookOpen, CheckCircle2 } from 'lucide-react'
import heroClassroomImg from '../../assets/images/hero_classroom.png'
import heroCampusImg from '../../assets/images/hero_campus.png'

const spring = { type: 'spring', stiffness: 200, damping: 20 }

const divisions = [
  {
    title: 'Shiv Dhara Pre-Primary School',
    subtitle: 'Nurturing Early Years',
    range: 'LKG & UKG',
    mediums: 'English & Gujarati Medium',
    description: 'Providing a playful, secure, and creative foundation for young minds. Our curriculum focuses on early child development, motor skills, and bilingual language learning.',
    image: heroClassroomImg,
    icon: Smile,
    features: [
      'Activity-Based Play Learning',
      'Cognitive & Motor Skills Focus',
      'Bilingual Language Development',
      'Caring & Secure Environment',
    ],
  },
  {
    title: 'Shree Bala International School',
    subtitle: 'Primary & Upper Primary Education',
    range: '1st – 8th Standard',
    mediums: 'English & Gujarati Medium',
    description: 'A structured academic journey designed to build logical thinking, digital literacy, and core subject excellence while encouraging physical sports and creative arts.',
    image: heroCampusImg,
    icon: BookOpen,
    features: [
      'CBSE Aligned Core Subjects',
      'Smart Classrooms & Technology',
      'Holistic Sports & Fine Arts',
      'Personalized Academic Care',
    ],
  },
]

const AcademicProgramsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section id="programs" ref={ref} className="bg-section py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={spring}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-textMuted">
            Academics
          </p>
          <h2 className="font-playfair text-4xl font-semibold text-textPrimary md:text-5xl">
            Our Academic Divisions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-textMuted">
            Delivering quality education across pre-primary and primary sections in both English and Gujarati mediums.
          </p>
        </motion.div>

        {/* Division cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {divisions.map((division, index) => {
            const Icon = division.icon
            return (
              <motion.div
                key={division.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...spring, delay: 0.2 + index * 0.15 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:shadow-card-hover"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
              >
                <div className="relative h-56 overflow-hidden md:h-64">
                  <img
                    src={division.image}
                    alt={division.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-white/95 px-3 py-1 text-xs font-semibold text-textPrimary backdrop-blur-sm">
                      {division.range}
                    </span>
                    <span className="rounded-lg bg-textPrimary/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {division.mediums}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-section">
                      <Icon className="h-5 w-5 text-textPrimary" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-textMuted uppercase tracking-wider">
                        {division.subtitle}
                      </span>
                      <h3 className="text-lg font-semibold text-textPrimary leading-tight">
                        {division.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[14px] leading-relaxed text-textMuted mb-6">
                    {division.description}
                  </p>

                  <div className="mt-auto border-t border-border pt-5">
                    <h4 className="text-xs font-semibold text-textPrimary uppercase tracking-wider mb-3">
                      Key Highlights
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {division.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-textPrimary" />
                          <span className="text-xs text-textMuted">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Board info bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ ...spring, delay: 0.6 }}
          className="mt-16 text-center text-xs text-textMuted"
        >
          <p>
            Shiv Dhara Educational Charitable Trust · Serving the Community Since 2014
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default AcademicProgramsSection
