import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { notices } from '../../data'
import { formatDate } from '../../utils/helpers'

const spring = { type: 'spring', stiffness: 200, damping: 20 }

const NoticeBoardSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const latestNotices = notices.slice(0, 4)

  return (
    <section id="notices" ref={ref} className="bg-[#FAFAF8] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-5">
          {/* Left intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={spring}
            className="lg:col-span-2"
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-textMuted">
              Stay Updated
            </p>
            <h2 className="mb-4 font-playfair text-4xl font-semibold text-textPrimary">
              Notice Board
            </h2>
            <p className="mb-8 text-[15px] leading-relaxed text-textMuted">
              Important announcements, upcoming events, and school updates — all in one place.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className="flex items-center gap-2 rounded-xl border border-textPrimary px-6 py-2.5 text-sm font-medium text-textPrimary transition-colors hover:bg-textPrimary hover:text-white"
              tabIndex={0}
              aria-label="View All Notices"
            >
              View All Notices
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>

          {/* Notice cards */}
          <div className="space-y-3 lg:col-span-3">
            {latestNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...spring, delay: 0.1 + index * 0.08 }}
                className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-card-hover"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="rounded-md border border-border bg-section px-2.5 py-0.5 text-[11px] font-medium text-textPrimary">
                    {notice.category}
                  </span>
                  <span className="text-xs text-textMuted">
                    {formatDate(notice.date)}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-textPrimary">
                  {notice.title}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-textMuted line-clamp-2">
                  {notice.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default NoticeBoardSection
