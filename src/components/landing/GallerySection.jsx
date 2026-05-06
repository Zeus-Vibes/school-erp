import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import gallery1 from '../../assets/images/gallery1.jpeg'
import gallery2 from '../../assets/images/gallery2.jpeg'
import gallery3 from '../../assets/images/gallery3.jpeg'
import gallery4 from '../../assets/images/gallery4.jpeg'
import gallery5 from '../../assets/images/gallery5.jpeg'
import gallery6 from '../../assets/images/gallery6.jpeg'
import gallery7 from '../../assets/images/gallery7.jpeg'

const spring = { type: 'spring', stiffness: 200, damping: 20 }

const galleryItems = [
  { label: 'School Events', span: 'col-span-2 row-span-2', image: gallery1 },
  { label: 'Sports Day', span: '', image: gallery2 },
  { label: 'Science Fair', span: '', image: gallery3 },
  { label: 'Cultural Fest', span: '', image: gallery4 },
  { label: 'Annual Day', span: '', image: gallery5 },
  { label: 'Classroom', span: '', image: gallery6 },
  { label: 'Campus Life', span: '', image: gallery7 },
]

const GallerySection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section ref={ref} className="bg-textPrimary py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={spring}
          className="mb-14"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
            Campus Life
          </p>
          <h2 className="font-playfair text-4xl font-semibold text-white md:text-5xl">
            Life at Shree Bala
          </h2>
          <p className="mt-4 max-w-md text-[15px] text-white/50">
            Moments of learning, growth, and celebration.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[180px]">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...spring, delay: index * 0.06 }}
              className={`group relative overflow-hidden rounded-xl cursor-pointer ${item.span}`}
            >
              <img
                src={item.image}
                alt={item.label}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40 flex items-end p-4">
                <span className="text-sm font-medium text-white opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  {item.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GallerySection
