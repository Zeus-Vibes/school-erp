import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import heroImg from '../../assets/images/hero.jpeg'

const spring = { type: 'spring', stiffness: 200, damping: 20 }

const achievements = [
  'CBSE Affiliated',
  'Smart Campus',
  '10+ Years Legacy',
]

const AboutSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="about" ref={ref} className="bg-[#FAFAF8] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={spring}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-textMuted">
              About Us
            </p>
            <h2 className="mb-8 font-playfair text-4xl font-semibold leading-tight text-textPrimary md:text-5xl">
              A Legacy of Academic{' '}
              <span className="italic">Excellence</span>
            </h2>
            <div className="space-y-5 text-[15px] leading-relaxed text-textMuted">
              <p>
                Founded in 2014 under the{' '}
                <span className="font-medium text-textPrimary">
                  Shiv Dhara Educational Charitable Trust
                </span>
                , our institution is dedicated to nurturing young minds in Ahmedabad. We operate through two specialized divisions:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-textPrimary">
                <li>
                  <span className="font-semibold">Shiv Dhara Pre-Primary School</span>, catering to LKG and UKG.
                </li>
                <li>
                  <span className="font-semibold">Shree Bala International School</span>, offering 1st to 8th Standard.
                </li>
              </ul>
              <p>
                Both divisions offer education in both English and Gujarati mediums. With state-of-the-art classrooms and dedicated faculty, we provide an environment where every child can grow.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {achievements.map((label, index) => (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ ...spring, delay: 0.3 + index * 0.08 }}
                  className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-textPrimary"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                >
                  {label}
                </motion.span>
              ))}
            </div>

            <motion.a
              href="#programs"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ ...spring, delay: 0.6 }}
              className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-textPrimary underline underline-offset-4 decoration-border hover:decoration-textPrimary transition-colors"
            >
              Our Academic Programs
              <ArrowUpRight className="h-3.5 w-3.5" />
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...spring, delay: 0.2 }}
            className="relative"
          >
            <div
              className="overflow-hidden rounded-2xl"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <img
                src={heroImg}
                alt="Shree Bala International School Campus"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-xl border border-border bg-white px-5 py-3" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <p className="font-playfair text-2xl font-semibold text-textPrimary">2014</p>
              <p className="text-xs text-textMuted">Established</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
