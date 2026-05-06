import { Search, X } from 'lucide-react'

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-10 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
      aria-label={placeholder}
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
        aria-label="Clear search"
        tabIndex={0}
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
)

export default SearchBar
