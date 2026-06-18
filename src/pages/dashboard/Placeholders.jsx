const ComingSoonPage = ({ title, sprint }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
      <div className="relative mb-6">
        <div className="h-16 w-16 animate-pulse rounded-2xl bg-accent/20 flex items-center justify-center">
          <span className="text-2xl text-accent font-bold">✨</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-textPrimary mb-2">{title}</h2>
      <p className="text-sm text-textMuted max-w-md mb-6">
        This section is currently in development. It will be fully functional in {sprint}.
      </p>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-accent border border-primary/30">
        Sprint Goal: {sprint}
      </span>
    </div>
  )
}

export const ClassesPagePlaceholder = () => <ComingSoonPage title="Classes Management" sprint="Sprint 2" />
export const AcademicYearsPagePlaceholder = () => <ComingSoonPage title="Academic Years Management" sprint="Sprint 2" />
export const TimetableGridPlaceholder = () => <ComingSoonPage title="Timetable Grid Editor" sprint="Sprint 3" />
export const ExaminationsPagePlaceholder = () => <ComingSoonPage title="Examinations Management" sprint="Sprint 3" />
export const ExamDetailPagePlaceholder = () => <ComingSoonPage title="Examination Detail View" sprint="Sprint 3" />
export const LCGeneratorPagePlaceholder = () => <ComingSoonPage title="Leaving Certificate Generator" sprint="Sprint 4" />
export const BulkPromotionPagePlaceholder = () => <ComingSoonPage title="Bulk Student Promotion" sprint="Sprint 4" />
export const CalendarPagePlaceholder = () => <ComingSoonPage title="School Calendar" sprint="Sprint 4" />
export const SettingsPagePlaceholder = () => <ComingSoonPage title="System Settings" sprint="Sprint 4" />
export const MarksEntryPagePlaceholder = () => <ComingSoonPage title="Marks Entry Portal" sprint="Sprint 3" />
export const ReportCardsPagePlaceholder = () => <ComingSoonPage title="Student Report Cards" sprint="Sprint 4" />
export const ProfilePagePlaceholder = () => <ComingSoonPage title="User Profile" sprint="Sprint 4" />
