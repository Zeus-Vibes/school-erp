import { getSchoolBrand } from '../../utils/schoolBrand'

const SchoolBrandBadge = ({ standard }) => {
  const brand = getSchoolBrand(standard)
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${brand.badgeClass}`}
      aria-label={`School Brand: ${brand.name}`}
    >
      {brand.name}
    </span>
  )
}

export default SchoolBrandBadge
