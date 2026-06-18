import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

const ConfirmDialog = ({ 
  isOpen, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel', 
  isDanger = false,
  onConfirm, 
  onCancel 
}) => {
  const handleOverlayKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleConfirmKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onConfirm()
    }
  }

  const handleCancelKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onKeyDown={handleOverlayKeyDown}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-section border border-border rounded-2xl shadow-xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${isDanger ? 'text-highlight' : 'text-accent'}`} />
                <h3 id="confirm-dialog-title" className="text-base font-bold text-textPrimary">{title}</h3>
              </div>
              <button 
                onClick={onCancel}
                onKeyDown={handleCancelKeyDown}
                tabIndex={0}
                aria-label="Close dialog"
                className="text-textMuted hover:text-textPrimary rounded-lg p-1 hover:bg-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="text-sm text-textMuted leading-relaxed">{message}</div>
            </div>
            
            <div className="flex justify-end gap-3 bg-black/10 border-t border-border px-5 py-4">
              <button 
                onClick={onCancel}
                onKeyDown={handleCancelKeyDown}
                tabIndex={0}
                aria-label={cancelLabel}
                className="px-4 py-2 text-sm font-semibold border border-border rounded-xl hover:bg-white/5 text-textPrimary cursor-pointer transition-all"
              >
                {cancelLabel}
              </button>
              <button 
                onClick={onConfirm}
                onKeyDown={handleConfirmKeyDown}
                tabIndex={0}
                aria-label={confirmLabel}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-button cursor-pointer transition-all ${
                  isDanger 
                    ? 'bg-highlight hover:bg-highlight/95' 
                    : 'bg-primary hover:bg-primary/95'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog
