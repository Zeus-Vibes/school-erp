import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Monitor, Video, BookOpen, Trophy, Cpu, Bus } from 'lucide-react'
import smartClassroomImg from '../../assets/images/smart_classroom.png'
import avRoomImg from '../../assets/images/hero_events.png'
import libraryImg from '../../assets/images/school_library.png'
import sportsImg from '../../assets/images/sports_complex.png'
import computerLabImg from '../../assets/images/computer_lab.png'
import transportImg from '../../assets/images/school_transport.png'

const spring = { type: 'spring', stiffness: 200, damping: 20 }

const facilities = [
  { icon: Monitor, title: 'Smart Classrooms', desc: 'Interactive boards with projectors in every classroom', image: smartClassroomImg },
  { icon: Video, title: 'AV Room', desc: 'Interactive audio-visual room for multimedia learning, screenings, and student presentations', image: avRoomImg },
  { icon: BookOpen, title: 'Library', desc: 'Rich collection of children books, storybooks, and reference guides', image: libraryImg },
  { icon: Trophy, title: 'Sports Complex', desc: 'Cricket, Football, Basketball & Athletics', image: sportsImg },
  { icon: Cpu, title: 'Computer Lab', desc: '50-seat lab with latest hardware & software', image: computerLabImg },
  { icon: Bus, title: 'Transport', desc: '30+ routes covering all residential areas', image: transportImg },
]

const FacilitiesSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section id="facilities" ref={ref} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={spring}
          className="mb-16"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-textMuted">
            Infrastructure
          </p>
          <h2 className="font-playfair text-4xl font-semibold text-textPrimary md:text-5xl">
            World-Class Facilities
          </h2>
          <p className="mt-4 max-w-lg text-[15px] text-textMuted">
            Everything your child needs to learn, grow, and thrive — under one roof.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map(({ icon: Icon, title, desc, image }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...spring, delay: index * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-card-hover"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-section">
                  <Icon className="h-4 w-4 text-textPrimary" />
                </div>
                <h3 className="mb-1.5 text-[15px] font-semibold text-textPrimary">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-textMuted">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FacilitiesSection
