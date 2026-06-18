import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import heroImg from '../../assets/images/hero.jpeg'
import heroClassroom from '../../assets/images/hero_classroom.png'
import heroCampus from '../../assets/images/hero_campus.png'
import heroEvents from '../../assets/images/hero_events.png'

const slides = [
  {
    image: heroImg,
    heroText: 'Discover',
    subText: 'Shree Bala International School',
  },
  {
    image: heroClassroom,
    heroText: 'Learn',
    subText: 'Smart Classrooms & Digital Education',
  },
  {
    image: heroCampus,
    heroText: 'Explore',
    subText: 'World-Class Campus & Sports Facilities',
  },
  {
    image: heroEvents,
    heroText: 'Celebrate',
    subText: 'Cultural Events & Student Life',
  },
]

const spring = { type: 'spring', stiffness: 200, damping: 20 }
const springDelayed = (delay) => ({ ...spring, delay })

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasZoomed, setHasZoomed] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayTimer = useRef(null)

  useEffect(() => {
    const zoomTimer = setTimeout(() => setHasZoomed(true), 200)
    const contentTimer = setTimeout(() => setShowContent(true), 800)
    return () => {
      clearTimeout(zoomTimer)
      clearTimeout(contentTimer)
    }
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || !showContent) return
    autoPlayTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(autoPlayTimer.current)
  }, [isAutoPlaying, showContent])

  const handleSlideChange = useCallback((index) => {
    setActiveIndex(index)
    setIsAutoPlaying(false)
    clearInterval(autoPlayTimer.current)
    setTimeout(() => setIsAutoPlaying(true), 6000)
  }, [])

  const currentSlide = slides[activeIndex]

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAF8]"
    >
      {/* Background with zoom-in entrance */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${activeIndex}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img
            src={currentSlide.image}
            alt={currentSlide.heroText}
            className="h-full w-full object-cover object-center"
            initial={!hasZoomed ? { scale: 0.05 } : { scale: 1 }}
            animate={{ scale: 1 }}
            transition={{ ...spring, duration: 1.4 }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle dark overlay — always visible from mount */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        <AnimatePresence mode="wait">
          <motion.h1
            key={`hero-${activeIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: springDelayed(0.05) }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
            className="font-playfair text-white leading-[0.9] select-none"
            style={{ fontSize: 'clamp(72px, 14vw, 140px)', fontWeight: 700 }}
          >
            {currentSlide.heroText}
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`sub-${activeIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: springDelayed(0.12) }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            className="mt-5 font-inter text-white/80 tracking-wide select-none"
            style={{ fontSize: 'clamp(14px, 2vw, 22px)', fontWeight: 400 }}
          >
            {currentSlide.subText}
          </motion.p>
        </AnimatePresence>

        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springDelayed(0.2)}
            className="mt-12 flex items-center gap-4"
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
                className="group flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-medium text-textPrimary transition-colors hover:bg-textPrimary hover:text-white"
                tabIndex={0}
                aria-label="Explore Portal"
              >
                Explore Portal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
            </Link>
            <a href="#about">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
                className="rounded-xl border border-white/30 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/60"
                tabIndex={0}
                aria-label="Learn More"
              >
                Learn More
              </motion.button>
            </a>
          </motion.div>
        )}
      </div>

      {/* Thumbnail navigation */}
      {showContent && (
        <LayoutGroup>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springDelayed(0.3)}
            className="absolute bottom-10 inset-x-0 z-20 flex justify-center items-center gap-2.5"
          >
            {slides.map((slide, index) => {
              const isActive = index === activeIndex
              return (
                <motion.button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                  className="relative overflow-hidden focus:outline-none"
                  style={{
                    width: isActive ? 110 : 56,
                    height: isActive ? 68 : 38,
                    borderRadius: 12,
                    transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1), height 0.5s cubic-bezier(0.22,1,0.36,1)',
                    boxShadow: isActive
                      ? '0 0 0 2px rgba(255,255,255,0.8), 0 4px 16px rgba(0,0,0,0.2)'
                      : '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                  tabIndex={0}
                  aria-label={`View: ${slide.heroText}`}
                >
                  <img
                    src={slide.image}
                    alt={slide.heroText}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/25 transition-colors duration-300 hover:bg-black/10" />
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        </LayoutGroup>
      )}

      {/* Progress bar */}
      {showContent && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-white/10">
          <motion.div
            key={`progress-${activeIndex}`}
            className="h-full bg-white/60"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </div>
      )}
    </section>
  )
}

export default HeroSection
