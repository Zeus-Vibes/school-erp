const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16" role="status" aria-label={label}>
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    <p className="mt-3 text-sm text-textMuted">{label}</p>
  </div>
)

export default LoadingSpinner
