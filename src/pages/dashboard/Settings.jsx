import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Info, User, ShieldAlert, Calendar, GraduationCap, Save } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import { useData } from '../../context/DataContext'
import toast from 'react-hot-toast'

const Settings = () => {
  const navigate = useNavigate()
  const { settings, updateSettings, academicYears, setActiveAcademicYear } = useData()

  // 1. School Info Form State
  const [schoolName, setSchoolName] = useState(settings.schoolName || '')
  const [address, setAddress] = useState(settings.address || '')
  const [phone, setPhone] = useState(settings.phone || '')
  const [email, setEmail] = useState(settings.email || '')
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || '')
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || '')
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || '')
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || '')

  // 2. Key Personnel State
  const [principalName, setPrincipalName] = useState(settings.principalName || '')
  const [registrarName, setRegistrarName] = useState(settings.registrarName || '')

  // 3. System Settings State
  const [lowAttendanceThreshold, setLowAttendanceThreshold] = useState(settings.lowAttendanceThreshold || 75)

  // 4. Academic Year State
  const activeYearId = useMemo(() => {
    return academicYears.find((y) => y.isActive)?.id || ''
  }, [academicYears])
  const [selectedYearId, setSelectedYearId] = useState(activeYearId)

  // Form Submit Handlers
  const handleSaveSchoolInfo = (e) => {
    e.preventDefault()
    updateSettings({
      schoolName,
      address,
      phone,
      email,
      whatsapp,
      instagramUrl,
      facebookUrl,
      youtubeUrl
    })
    toast.success('School Information saved successfully!')
  }

  const handleSavePersonnel = (e) => {
    e.preventDefault()
    updateSettings({
      principalName,
      registrarName
    })
    toast.success('Key Personnel updated successfully!')
  }

  const handleSaveSystemSettings = (e) => {
    e.preventDefault()
    const threshold = Number(lowAttendanceThreshold)
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      toast.error('Attendance threshold must be between 0 and 100')
      return
    }
    updateSettings({
      lowAttendanceThreshold: threshold
    })
    toast.success('System Settings updated successfully!')
  }

  const handleSaveAcademicYear = (e) => {
    e.preventDefault()
    if (!selectedYearId) {
      toast.error('Please select an academic year')
      return
    }
    setActiveAcademicYear(selectedYearId)
    toast.success(`Active Academic Year set to ${selectedYearId}!`)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader title="System Settings" />

      {/* SECTION 1: SCHOOL INFORMATION */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
          <Info className="h-5 w-5 text-primary" />
          School Information
        </h3>

        <form onSubmit={handleSaveSchoolInfo} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-textMuted">School Name *</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-textMuted">Address *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-textMuted">Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-textMuted">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-textMuted">WhatsApp Contact</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-textMuted">Instagram Profile URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-textMuted">Facebook Page URL</label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-textMuted">YouTube Channel URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-button hover:bg-primary/95 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> Save Info
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: KEY PERSONNEL */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
          <User className="h-5 w-5 text-primary" />
          Key Personnel (Printed Documents Authority)
        </h3>

        <form onSubmit={handleSavePersonnel} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-textMuted">Principal Name (LC + Report Cards)</label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-textMuted">Registrar Name (ID Cards + LC)</label>
              <input
                type="text"
                value={registrarName}
                onChange={(e) => setRegistrarName(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-button hover:bg-primary/95 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> Save Personnel
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: SYSTEM SETTINGS */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
          <ShieldAlert className="h-5 w-5 text-primary" />
          System Settings & Thresholds
        </h3>

        <form onSubmit={handleSaveSystemSettings} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-textMuted">Low Attendance Threshold (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={lowAttendanceThreshold}
              onChange={(e) => setLowAttendanceThreshold(e.target.value)}
              required
              className="w-48 rounded-xl border border-border px-4 py-2.5 text-sm"
            />
            <p className="text-[10px] text-textMuted mt-1">
              Warn students and color-code dashboard widgets if attendance rate falls below this percentage
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-button hover:bg-primary/95 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> Save System Settings
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: ACADEMIC YEAR */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
          <Calendar className="h-5 w-5 text-primary" />
          Academic Year Control
        </h3>

        <form onSubmit={handleSaveAcademicYear} className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1 w-64">
              <label className="text-xs font-semibold text-textMuted uppercase">Active Year Selector</label>
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.label} {y.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-primary/95 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> Save Year
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard/admin/bulk-promotion')}
              className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5 ml-auto"
            >
              <GraduationCap className="h-4.5 w-4.5" /> Bulk Student Promotion
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default Settings
