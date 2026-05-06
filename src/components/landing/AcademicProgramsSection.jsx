import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FlaskConical, BarChart3, Palette } from 'lucide-react'
import scienceStreamImg from '../../assets/images/science_stream.png'
import commerceStreamImg from '../../assets/images/commerce_stream.png'
import artsStreamImg from '../../assets/images/arts_stream.png'

const spring = { type: 'spring', stiffness: 200, damping: 20 }

const levels = [
  { stage: 'Pre-Primary', range: 'Nursery, LKG, UKG' },
  { stage: 'Primary', range: 'Class 1 – 8' },
  { stage: 'Secondary', range: 'Class 9 & 10' },
  { stage: 'Higher Secondary', range: 'Class 11 & 12' },
]

const streams = [
  {
    title: 'Science', icon: FlaskConical, image: scienceStreamImg,
    subjects: ['Physics', 'Chemistry', 'Biology / Mathematics', 'English (Core)', 'Computer Sci.'],
    careers: ['Engineering', 'Medicine', 'Research', 'Technology'],
  },
  {
    title: 'Commerce', icon: BarChart3, image: commerceStreamImg,
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'English (Core)', 'Maths / I.P.'],
    careers: ['CA', 'Finance', 'Banking', 'Management'],
  },
  {
    title: 'Arts', icon: Palette, image: artsStreamImg,
    subjects: ['History', 'Geography', 'Political Science', 'English (Core)', 'Psychology'],
    careers: ['Law', 'Civil Services', 'Journalism', 'Education'],
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
          className="mb-16"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-textMuted">
            Academics
          </p>
          <h2 className="font-playfair text-4xl font-semibold text-textPrimary md:text-5xl">
            Academic Programs
          </h2>
          <p className="mt-4 max-w-lg text-[15px] text-textMuted">
            From Nursery to Higher Secondary — a structured journey for every stage of growth.
          </p>
        </motion.div>

        {/* Grade Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring, delay: 0.1 }}
          className="mb-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {levels.map((level, index) => (
            <motion.div
              key={level.stage}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...spring, delay: 0.15 + index * 0.06 }}
              className="rounded-2xl border border-border bg-white px-6 py-5"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <p className="text-sm font-semibold text-textPrimary">{level.stage}</p>
              <p className="mt-1 text-xs text-textMuted">{level.range}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Streams header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring, delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="font-playfair text-2xl font-semibold text-textPrimary">
            Higher Secondary Streams
          </h3>
          <p className="mt-2 text-sm text-textMuted">
            Class 11 & 12 · English Medium · CBSE Board
          </p>
        </motion.div>

        {/* Stream cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {streams.map(({ title, icon: Icon, image, subjects, careers }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...spring, delay: 0.4 + index * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-card-hover"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-section">
                    <Icon className="h-4 w-4 text-textPrimary" />
                  </div>
                  <h4 className="text-[15px] font-semibold text-textPrimary">{title}</h4>
                </div>
                <div className="mb-4 space-y-1.5">
                  {subjects.map((subject) => (
                    <p key={subject} className="text-xs text-textMuted">
                      {subject}
                    </p>
                  ))}
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-textMuted">
                    <span className="font-medium text-textPrimary">Careers: </span>
                    {careers.join(' · ')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Board info bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ ...spring, delay: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-textMuted"
        >
          <span>CBSE Affiliated — English Medium</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span>Gujarat Board — Gujarati Medium</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span>Science · Commerce · Arts</span>
        </motion.div>
      </div>
    </section>
  )
}

export default AcademicProgramsSection
