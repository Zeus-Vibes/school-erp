import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: 1200, suffix: '+', label: 'Students Enrolled' },
  { value: 50, suffix: '+', label: 'Expert Teachers' },
  { value: 10, suffix: '+', label: 'Years of Legacy' },
  { value: 15, suffix: '+', label: 'Awards Won' },
]

const spring = { type: 'spring', stiffness: 200, damping: 20 }

const CountUp = ({ target, suffix, isInView }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let startTime = null
    const duration = 2000

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [isInView, target])

  return (
    <span className="font-playfair text-4xl font-semibold text-textPrimary md:text-5xl">
      {count}{suffix}
    </span>
  )
}

const StatsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="stats" ref={ref} className="border-y border-border bg-[#FAFAF8] py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...spring, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <CountUp target={stat.value} suffix={stat.suffix} isInView={isInView} />
              <p className="mt-2 text-sm text-textMuted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
