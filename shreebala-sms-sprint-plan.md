# Shree Bala International School SMS — Frontend Sprint Plan
## React 19 + Vite + Tailwind CSS | PRD v3.0
**Total Scope:** 4 Sprints | ~2 weeks delivery | All 3 dashboards (Admin + Teacher + Student)

> **Rule:** Backend connects AFTER all 4 sprints are complete. Everything runs on mock data + DataContext until then.

---

## Sprint Overview

| Sprint | Theme | Pages / Files | Deliverable |
|--------|-------|---------------|-------------|
| **S1** | Foundation & Auth | Auth, Sidebar, DataContext, Mock Data | Login works, routing works, sidebar correct for all 3 roles |
| **S2** | Core Admin Pages | Dashboard, Classes, Academic Years, Students, Teachers | Admin can manage all people + classes |
| **S3** | Operations Pages | Timetable, Attendance, Fees, Examinations, Notices | All operational flows working |
| **S4** | Documents & Student/Teacher Dashboards | LC Generator, ID Cards, Report Cards, Bulk Promotion, Calendar, Settings, Teacher & Student full dashboards | Complete product |

---

## Sprint 1 — Foundation & Auth
**Goal:** Everything boots correctly. Login works. Routing is protected. Sidebar matches PRD for all 3 roles. DataContext carries the full state shape.

### 1.1 Files to Create / Modify

| File | Action | What to do |
|------|--------|-----------|
| `src/data/mockUsers.js` | CREATE | 3 mock users: admin, teacher, student with userId + role + name + password |
| `src/data/mockAcademicYears.js` | CREATE | 2 records: 2024-25 (active), 2023-24 (inactive) |
| `src/data/mockClasses.js` | CREATE | Min 3 classes: LKG A, Class 3 Eng A, Class 5 Guj B — full schema per PRD §5 |
| `src/data/mockTeachers.js` | UPDATE | Rebuild to PRD §8 schema: employeeId, subjectClassMapping array, classTeacherOf, salary, userId |
| `src/data/mockStudents.js` | UPDATE | Rebuild to PRD §7 schema: grNumber, rollNumber, house, clubs, father/mother objects, isActive, lcId |
| `src/data/mockDashboard.js` | CREATE | Static stats object per PRD §4 |
| `src/data/mockNotices.js` | CREATE/UPDATE | Add sendTo, priority, pinned, validUntil fields |
| `src/context/AuthContext.jsx` | MODIFY | Remove email login. Add userId + role selector. Match from mockUsers. Store in localStorage. Redirect by role. |
| `src/context/DataContext.jsx` | MODIFY | Full state shape per PRD §22. All CRUD functions. academicYears, classes, teachers, students, timetables, attendanceRecords, holidays, feeStructures, feePayments, customInstallmentPlans, exams, examMarks, notices, lcRecords. |
| `src/pages/LoginPage.jsx` | MODIFY | Remove email + rememberMe. Add role selector tabs (Admin/Teacher/Student). Change first input to User ID. Keep show/hide password toggle. |
| `src/components/ProtectedRoute.jsx` | CREATE | Takes `allowedRole` prop. Redirects to `/login` if not logged in or role mismatch. |
| `src/components/Sidebar.jsx` | MODIFY | 3 separate nav arrays per PRD §3. Remove Library. Add Classes, Academic Years, LC Generator, Calendar (admin). Correct icons via Lucide. |
| `src/App.jsx` | MODIFY | Full route map per PRD §23. All nested routes under 3 ProtectedRoute wrappers. Placeholder pages for not-yet-built routes. |

### 1.2 Shared Components to Create

| Component | Purpose |
|-----------|---------|
| `src/components/shared/ConfirmDialog.jsx` | Reusable confirm modal — used in LC, Marks Submit, Delete, Bulk Promotion |
| `src/components/shared/StatusBadge.jsx` | Consistent colored badges — Active, Left, Graduated, HeldBack, Draft, Published, Paid, Pending |
| `src/components/shared/EmptyState.jsx` | Empty table/list state with icon + title + optional action button |
| `src/components/shared/SchoolBrandBadge.jsx` | "Shiv Dhara" (blue) / "Shree Bala" (green) badge |
| `src/utils/schoolBrand.js` | `getSchoolBrand(standard)` utility — used everywhere standard is selected |

### 1.3 Mock Data Schemas (Reference)

**mockUsers.js**
```js
{ userId: 'SBIS-ADMIN-001', role: 'admin', name: 'Rajesh Sharma', password: 'Admin@123' }
{ userId: 'SBIS-TCH-2425-001', role: 'teacher', name: 'Priya Mehta', password: 'Teacher@123' }
{ userId: 'SB-2425-3A-01', role: 'student', name: 'Aarav Patel', password: 'Student@123' }
```

**AuthContext login logic (dev mode)**
```js
// Match userId + role from mockUsers array — any password works
const user = mockUsers.find(u => u.userId === userId && u.role === selectedRole);
if (user) → store in context + redirect
else → show "Invalid credentials" error
```

### 1.4 Routing to Wire Up (App.jsx)
```
/ → LandingPage (DO NOT TOUCH)
/login → LoginPage

/dashboard/admin → ProtectedRoute(role="admin") → DashboardLayout
  index → AdminDashboard
  classes, academic-years, students, teachers, timetable, timetable/:id/edit
  attendance, fees, examinations, examinations/:examId
  notices, id-cards, lc, bulk-promotion, calendar, settings

/dashboard/teacher → ProtectedRoute(role="teacher") → DashboardLayout
  index → TeacherDashboard
  timetable, classes, students, attendance, marks, notices, calendar, profile

/dashboard/student → ProtectedRoute(role="student") → DashboardLayout
  index → StudentDashboard
  timetable, attendance, report-cards, fees, id-card, notices, calendar, profile
```

### 1.5 Sprint 1 Completion Criteria
- [ ] Login with all 3 mock userIds works and redirects correctly
- [ ] Invalid userId shows error toast
- [ ] Sidebar renders correct items per role (no Library anywhere)
- [ ] All routes resolve without crash (can be placeholder `<div>Coming soon</div>`)
- [ ] DataContext exposes full state shape — all CRUD functions present (even if stubbed)
- [ ] ProtectedRoute blocks wrong-role access and unauthenticated access
- [ ] Logout clears context + localStorage and redirects to `/`

---

## Sprint 2 — Core Admin Pages
**Goal:** Admin can fully manage Academic Years, Classes, Students, and Teachers. Admin Dashboard shows all 3 rows of stat cards + alerts panel.

### 2.1 Admin Dashboard (AdminDashboard.jsx)

**Changes from current:**
- Keep: dark card style, welcome banner, fee bar chart, attendance donut, recent fees table, latest notices panel
- Remove: standalone "Avg Attendance" card (fold into row 1)
- Add: Row 2 (house counts), Row 3 (admissions/LC/pending fees/today attendance)
- Add: Pending Alerts panel (4 colored alert rows)
- Update Quick Actions: remove "Mark Attendance", add "Generate LC"

**Stat Cards Layout:**
```
Row 1 (4 cards): Total Students | Total Teachers | Fees Collected | Avg Attendance
Row 2 (4 cards): 🔴 Red House | 🟢 Green House | 🔵 Blue House | 🟡 Yellow House
Row 3 (4 cards): New Admissions (month) | LC Issued (month) | Pending Fees | Today Attendance %
```

**Alerts Panel (4 rows, colored left border):**
```
⚠️ yellow  → Classes without published timetable: 4       → link /timetable
🔴 red     → Students with overdue fees: 23               → link /fees
⚠️ yellow  → Exams with incomplete marks: 2               → link /examinations
🔵 blue    → Students below 75% attendance: 18            → link /attendance
```

### 2.2 Academic Years Page (AcademicYears.jsx) — NEW

| Element | Detail |
|---------|--------|
| Table | Year Label, Start Date, End Date, Status badge (Active/Past), Actions |
| Add Modal | Year Label, Start Date, End Date |
| Set Active | Button per row — sets that year active, deactivates all others. One active year max. |
| No delete | If year has classes/students linked, deletion blocked |

**Key logic:**
```js
setActiveYear(yearId) → set all isActive=false → set target isActive=true → update context → toast
```

### 2.3 Classes Page (Classes.jsx) — NEW

**Table columns:** Standard | Medium | Division | School Brand badge | Class Teacher | Students | Room | Working Days | Actions

**Add/Edit Modal — 3 sections:**
- Basic Info: Academic Year, Standard (LKG–UKG–1–8), Medium, Division, Working Days (Mon-Fri/Mon-Sat), Room, Max Capacity
- Assignment: Class Teacher (select from active teachers)
- Subjects: dynamic list — each row has Subject Name + optional Syllabus textarea + Remove button

**Live auto-calculation:**
```js
// Updates as admin selects standard — shown as read-only field
getSchoolBrand('LKG') → 'Shiv Dhara School'   // badge: blue
getSchoolBrand('3')   → 'Shree Bala International School'  // badge: green
```

**Division dropdown in Students page** must be populated from this Classes collection filtered by selected Standard + Medium.

### 2.4 Students Page (Students.jsx) — UPDATE

**Form — 4 sections:**

| Section | Fields |
|---------|--------|
| Personal Info | Full Name*, Photo (file, max 2MB), DOB*, Gender*, Blood Group*, Aadhar (optional), Address* |
| Academic Info | GR Number* (manual, unique-validated), Roll Number*, Standard*, Medium*, Division* (from classes), Academic Year*, Admission Date* |
| House & Clubs | House* (radio: Red/Green/Blue/Yellow), Clubs (multi-check: Taekwondo, Chess, Art Club, Music Club) |
| Parent Details | Father Name*, Father Phone*, Father Occupation, Mother Name*, Mother Phone, Mother Occupation, Parent Email |

**Auto-calculated read-only display (live update):**
```
School Brand: [computed from standard]
User ID:      SB-{yearLabel}-{std}{div}-{rollNo}   e.g. SB-2425-3A-01
Password:     SBIS@{std}{div}{rollNo}               e.g. SBIS@3A01
```

**Credential Card Modal (on save):**
```
✅ Student Created Successfully!
User ID:   SB-2425-3A-01  [Copy]
Password:  SBIS@3A01      [Copy]
```

**Table columns:** Photo+Name | GR Number | Roll No | Class (std+div+medium) | School Brand badge | House (dot) | Status badge | Actions (View/Edit/Delete)

**Filters:** Standard (LKG–8) | Medium | Division | Status (Active/Left/Graduated/HeldBack)

**Student detail modal extras:**
- All fields in 2-column layout
- Credentials section (User ID + password visible to admin)
- [Reset Password] button
- [Issue LC] button → navigates to `/dashboard/admin/lc?studentId={id}`

### 2.5 Teachers Page (Teachers.jsx) — UPDATE

**Form — 4 sections:**

| Section | Fields |
|---------|--------|
| Personal Info | Full Name*, Photo, DOB*, Gender*, Phone*, Email*, Address* |
| Professional | Qualification*, Experience (years)*, Joining Date*, Salary (number, stored only) |
| Teaching Assignment | Subjects (tag input — multiple); Subject-Class Mapping (dynamic rows: Subject + Class + Remove) |
| Class Teacher | Class Teacher Of (select from classes, or None) |

**Auto-generated read-only:**
```
Employee ID: SBIS-TCH-001         (auto-incremented)
User ID:     SBIS-TCH-2425-001
Password:    SBIS@TCH001
```

**Table columns:** Photo+Name | Employee ID | Subjects (badges) | Class Teacher Of | Experience | Status | Actions (View/Edit/Deactivate)

**Salary visibility rule:** ONLY visible in teacher detail modal — never in table, never on any dashboard.

### 2.6 Sprint 2 Completion Criteria
- [ ] Admin Dashboard shows all 3 rows of stat cards from mock data
- [ ] Alerts panel shows 4 colored alert rows with correct links
- [ ] Academic Years: create year, set active year, single active enforced
- [ ] Classes: create/edit/delete class, brand auto-updates on standard change, subjects list editable
- [ ] Students: full form with all 4 sections saves, credential modal appears, filters work, detail modal has LC/reset buttons
- [ ] Teachers: full form saves, credential modal appears, subject-class mapping rows work dynamically
- [ ] Salary NEVER visible in table or dashboard
- [ ] getSchoolBrand() used consistently everywhere standard appears

---

## Sprint 3 — Operations Pages
**Goal:** All day-to-day operational flows — Timetable grid editor + publishing, Attendance marking, Fee management, Examinations + marks entry, Notice board — working for all 3 roles.

### 3.1 Timetable (Timetable.jsx + TimetableGrid.jsx)

**Admin List View:**
- Table: Class | Academic Year | Periods | Published (✅ Live / ⏳ Draft) | Last Updated | Actions (Edit Grid / Publish-Unpublish / Delete)
- [+ Create] button → Setup Modal (Class, Academic Year, Working Days, Periods/Day, Period Duration, Start Time)
- On create → navigate to `/dashboard/admin/timetable/:id/edit`

**Grid Editor (TimetableGrid.jsx):**
- Rows = time periods (auto-calculated from start time + duration) + break rows
- Columns = working days (Mon–Fri or Mon–Sat)
- Cells: Subject chip + Teacher name chip (colored)
- Break row: full-width blue band "🍽 Lunch Break"
- [+ Add Break Row] button

**Cell click → Slot Editor Modal:**
```
Step 1: Subject dropdown (from class.subjects)
Step 2: Teacher dropdown (filtered — only teachers with this subject in subjectClassMapping for this classId)
Conflict check: if teacher already assigned at same day+period in another timetable
  → yellow warning toast ONLY — never block:
     "⚠️ Mrs. Sharma is already in Class 4B at this slot. You can still proceed."
```

**Publishing:**
```
[Save Draft]  → isPublished=false, updates lastUpdatedAt
[Publish]     → isPublished=true, success toast, visible to teacher+student
[Unpublish]   → isPublished=false, hidden immediately
```

**Teacher Timetable (read-only):**
- Filter: published timetables where any slot.teacherId === currentTeacher.uid
- Display: Period | Time | Day | Class+Division | Subject | Room
- Show "Free" for unassigned periods
- Show "Last Updated: {timestamp}"

**Student Timetable (read-only):**
- Filter: published timetable where classId === student.currentClassId
- Full weekly grid with break rows

### 3.2 Attendance

**Admin overview:**
- Stat cards: Today %, This Month %, Low Attendance count, Working Days count
- Class-wise table: Class | Division | Total | Present | Absent | Late | %
- Low attendance alert list (students below threshold)

**Mark Attendance form (Admin + Teacher):**

| Field | Rule |
|-------|------|
| Class | Select — teacher only sees their mapped classes |
| Subject | Select — filtered from teacher's subjectClassMapping for selected class |
| Date | Date picker — max = today, NO future dates |
| Student list | Only students where `isActive === true` (LC students excluded) |

**Status options (UPDATE — add ML):**
```
P  = Present      (green)
A  = Absent       (red)
L  = Late         (yellow)
ML = Medical Leave (blue)   ← NEW
```

**Edit past attendance:**
- "Reason for Edit*" required textarea
- On save → push to editHistory: { editedBy, editedByName, editedAt, reason, previousRecords }

**Student Attendance Page:**
- Monthly calendar grid (7 columns) with prev/next month navigation
- Color-coded dots per day
- Legend: 🟢 P | 🔴 A | 🟡 L | 🔵 ML | ⬜ Holiday/Sunday
- Subject-wise breakdown table: Subject | Total Classes | Present | Absent | Late | %
- Overall % card + low attendance warning banner if below threshold

### 3.3 Fee Management (Fees.jsx)

**New tab: Fee Structure**
- Select Class + Academic Year
- Add fee items: Fee Type (Tuition/Annual/Exam/Sports/Other) | Amount | Frequency (Monthly/Quarterly/Annually/OneTime) | Due Day
- Late Fine toggle + amount
- Save Structure button

**Updates to student list:**
- Add GR Number column
- Add "Custom Plan" badge for students on installment plans

**Custom Installment Plan (from student fee detail):**
- [Create Custom Plan] button
- Modal: Total Amount, Reason (required), No. of installments
- Dynamic installment rows (generated by count): Amount | Due Date per row
- Validation: sum of all installments must equal total amount

**Fee Receipt — Half+Half A4 format:**
```
TOP HALF — School Copy:
  School Logo + Name + Address
  Receipt No + Date
  Student Name, GR No, Class
  Fee Type + Period + Amount
  Payment Mode
  Received By + Signature line

── [✂ Cut Here dashed line at 148.5mm] ──

BOTTOM HALF — Parent Copy:
  Same fields
  If custom plan: Installment No (e.g. 2 of 4) + Balance Remaining + Next Due Date
  Stamp area
```

**Receipt number format:** `RCP-SBIS-{year}-{4-digit-serial}` or `RCP-SDS-{year}-{serial}`

### 3.4 Examinations (Examinations.jsx — rebuilt from Results.jsx)

**Admin exam list:**
- Table: Exam Name | Class | Year | Status badge | Subjects Done (X/Y) | Actions
- [+ Create Exam] button

**Create Exam Modal:**
```
Exam Name*    → Select: Mid Term 1 | Mid Term 2 | Final Exam  (ONLY these 3)
Class*        → Select from classes
Academic Year*
Start Date*   + End Date*
Subjects      → Auto-loaded from class.subjects
  Per subject: Max Marks* | Passing Marks* | Assign Teacher (select)
Grade Ranges  → Editable defaults:
  90-100 → A+ → Outstanding
  75-89  → A  → Excellent
  60-74  → B  → Good
  45-59  → C  → Satisfactory
  33-44  → D  → Pass
  <33    → F  → Fail
```

**Exam status flow:**
```
Draft → Active → Marks Entry Open → Completed
Grey     Blue        Yellow/Orange      Green
```

**Exam Detail Page:**
- Subject completion tracker: each subject shows ✅ Submitted (teacher + date) or ⏳ Pending (teacher name)
- Progress: "X/Y subjects submitted"
- Banner: "🔒 Report cards LOCKED — 2 subjects pending" / "🔓 Report cards UNLOCKED"
- [Bulk Generate Report Cards] — enabled only when allSubmitted = true

**Report card unlock logic:**
```js
const allSubmitted = exam.subjects.every(s => s.marksSubmitted === true);
// true  → student can see report card
// false → student sees locked "Results Pending" state
```

**Teacher Marks Entry (MarksEntry.jsx):**
- Select Exam (only MarksEntryOpen exams for teacher's classes)
- Select Class (teacher's mapped classes)
- Select Subject (teacher's subjects for selected class)
- Table: Roll No | Student Name | Marks Input (0–maxMarks) | [AB] checkbox | [EX] checkbox
  - If AB or EX checked → disable marks input
- [Save Draft] — saves without submitting
- [Submit Marks] (red) — ConfirmDialog: "Marks cannot be edited after submission"
- After submit → inputs become read-only, "Submitted on {date}" badge
- On submit → set `marksSubmitted = true` for this subject in exam
- Auto-calculate grade per student using exam's gradeRanges

### 3.5 Notice Board (Notices.jsx)

**Updated Add Notice form:**

| Field | Detail |
|-------|--------|
| Title* | Text |
| Message* | Textarea |
| Send To* | All / Teachers Only / Students Only (admin) |
| Category* | Event / Finance / Holiday / Meeting / Academic |
| Priority* | Normal / Important / Urgent |
| Pin Notice | Toggle |
| Valid Until | Date (optional) |

**Priority visual styles:**
```
Normal   → white card (existing style)
Important → yellow left border (border-l-4 border-yellow-400) + subtle yellow bg
Urgent    → red left border (border-l-4 border-red-500) + subtle red bg + bold title
```

**Pinned notices always shown first in list.**

**Archive tab:** Notices where `validUntil < today` auto-moved here. Buttons: [Reactivate] [Delete]

**Teacher notices:**
- Send To options: All / All Faculty / All Students / My Class Students
- Teacher can only edit/delete their own notices

### 3.6 Sprint 3 Completion Criteria
- [ ] Timetable: admin creates timetable, opens grid editor, fills slots, conflict shows toast (not block), publish/unpublish works
- [ ] Teacher sees only their own periods in their timetable view
- [ ] Student sees published class timetable
- [ ] Attendance: subject filter works, ML status works, LC students excluded, no future dates, edit requires reason
- [ ] Student calendar view: colors correct, month navigation works
- [ ] Fees: fee structure tab saves, custom installment plan validates sum, receipt generates half+half A4
- [ ] Examinations: create exam with grade ranges, status flow works, teacher submits marks once (then locked)
- [ ] Report card locked/unlocked based on allSubmitted flag
- [ ] Notices: priority styling correct, archive tab works, teacher can only edit own notices

---

## Sprint 4 — Documents, LC, Dashboards & Final Polish
**Goal:** All document generation working. LC full flow. ID Cards all 4 types. Report card PDF. Bulk Promotion. Calendar. Settings. Teacher + Student dashboards fully corrected.

### 4.1 LC Generator (LCGenerator.jsx) — NEW

**4-step flow:**

**Step 1 — Search**
- Search box (name or GR number)
- Searches students array, filters `isActive === true` only (can't re-issue to already-left student)

**Step 2 — Student card preview**
- Photo + Name + GR + Class + Father Name
- Current month fee status badge: 🔴 PENDING or 🟢 CLEARED

**Step 3 — LC Form**
```
Leaving Date*   Date picker
Reason*         Select: Transfer to another city | Admission in another school |
                Parent's request | Completed education | Long absence | Other
                (Other → shows text input)
Conduct*        Textarea — free text
Fees Cleared    Toggle (pre-filled from fee status check)
```

**Step 4 — Preview + Issue**
- LCDocument component renders below form
- [Issue LC] button — RED, triggers ConfirmDialog:
  `"⚠️ This will deactivate the student's login. This action can be reversed."`
- On confirm:
  ```js
  // 1. Create LC record
  lcNumber: LC-SBIS-2425-{padded 4-digit serial}
  // 2. Update student
  isActive = false, status = 'Left', lcId = newLC.id, lcIssuedAt = now
  // 3. Show success toast + [Download LC PDF] button
  ```

**LC List view:**
- Table: LC Number | Student | Class | Issue Date | Status (Active/Cancelled) | [📥 PDF]
- Actions: View | Revoke/Cancel | Reprint

**LC Revoke:**
```js
revokeLCHandler → update LC: status='Cancelled', cancelledAt, cancellationReason (required)
               → update student: isActive=true, status='Active', lcId=null
               → toast: "LC cancelled. Student login restored."
// NEVER delete LC record — only set status='Cancelled'
```

### 4.2 LCDocument Component (LCDocument.jsx) — NEW

```
Header: Correct school name based on student.standard
        (Shiv Dhara School for LKG/UKG, Shree Bala International School for 1–8)
        Address + Phone

Title:  ════════ LEAVING CERTIFICATE ════════

Body:   LC Number + Date
        Student Name, GR Number, Roll Number, DOB, Blood Group
        Class, Medium, Admission Date
        Father's Name, Mother's Name, Address

Details: Last Class Attended, Date of Leaving, Reason, Conduct
         Fees Cleared: Yes / No
         Total Days, Present Days, Attendance %

Footer:  Registrar signature line
         Principal signature line
         [School Seal ○]
```

### 4.3 ID Cards — Complete Overhaul

**Page tabs:** `[Student ID] [Faculty ID] [Escort Pass]`
Student ID sub-toggle: `English (Blue) | Gujarati (Red)`

**StudentIDCard.jsx:**
```
Header color:
  English medium  → Blue  #1A5276
  Gujarati medium → Red   #922B21
School name in header:
  LKG/UKG → Shiv Dhara School
  1–8     → Shree Bala International School

Content: Circular photo (monogram fallback) | Name | GR Number
Details (cream bg): Roll No, Class+Div, DOB, Blood Group, House (colored dot),
                    Address, Parent Phone, Academic Year
Footer: Registrar signature line + Stamp circle
```

**FacultyIDCard.jsx:**
```
Header: White/plain always (never colored)
School: Shree Bala International School (always — no Shiv Dhara on faculty card)
Content: Photo | Name | Employee ID
Details: DOB, Subjects, Phone, Email
Footer: Registrar + Stamp
```

**GuardianEscortPass.jsx:**
```
Header color: Green #1E8449 always
Title: "GUARDIAN ESCORT PASS" (bold, white)
Content: Student photo | Name | Class+Division
Details: DOB, Academic Year, Father Name, Mother Name
Validity: "Valid for Academic Year {year}"
Footer: Registrar + Stamp
```

**Page layout — IDCards.jsx:**
- Left panel: selection controls (Class/Division/Student for student cards, Teacher for faculty)
- Right panel: live card preview
- Buttons: [Download PDF] (single) + [Bulk Download] (all in selected class)

**PDF dimensions:** `63.5mm × 100mm` portrait for all 3 card types.

### 4.4 Report Card Component (ReportCard.jsx) — NEW

```
Header: School branding (correct name based on student.standard) + Address + Phone
Student info: Name, GR No, Roll No, Class, Academic Year, Attendance summary

Marks table:
  Subject | Max Marks | Marks Obtained | % | Grade | Remarks

Total row: aggregated total + overall grade

Teacher Remarks (read-only in student view, editable by admin)
Principal Remarks (read-only in student view, editable by admin)

Footer:
  Class Teacher signature | Principal signature
```

**Report card PDF:** A4 portrait, scale 2, html2canvas → jsPDF

### 4.5 Bulk Promotion (BulkPromotion.jsx) — NEW

**Warning banner** (always shown — prominent):
```
⚠️ Academic Year Promotion
Promote all students from 2024-25 → 2025-26
IMPORTANT: Class teachers do NOT change. Review carefully before confirming.
```

**Filter:** Current Class dropdown

**Table:** Student Name | Current Standard | Promoted To | [☐ Hold Back]

**Promotion map:**
```
LKG → UKG → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → GRADUATE 🎓
```

**Key logic:**
```js
// UKG → 1: schoolBrand changes Shiv Dhara → Shree Bala
// Class 8 → GRADUATE: status='Graduated', standard stays '8'
// Hold Back: status='HeldBack', class unchanged
// All else: update standard + academicYearId + schoolBrand (recalculated)
```

**ConfirmDialog** with strong warning before executing.

### 4.6 Calendar (Calendar.jsx) — NEW

**Layout:**
- Left: Monthly calendar grid — holiday dates in red, Sundays in grey, month prev/next navigation
- Right: Upcoming holidays list — Name | Date | [Edit] [Delete]

**Add Holiday Modal:** Date* | Name* | Description (optional)

**Calendar logic:**
```js
isHoliday(date)   → holidays.some(h => h.date === formatted(date))
isSunday(date)    → date.getDay() === 0
isWorkingDay(date)→ !isHoliday(date) && !isSunday(date)
// Attendance working days count uses this
```

**Teacher + Student Calendar:** Same view, read-only. No add/edit/delete buttons.

### 4.7 Settings (Settings.jsx) — UPDATE

**4 sections:**

| Section | Fields |
|---------|--------|
| School Information | School Name, Address, Phone, Email, WhatsApp, Instagram URL, Facebook URL, YouTube URL |
| Key Personnel | Principal Name (used on LC + report cards), Registrar Name (used on ID cards + LC) |
| System Settings | Low Attendance Threshold (number, default 75) |
| Academic Year | Active year selector + [Bulk Promotion] link button |

Each section has its own [Save] button + success toast on save.

### 4.8 Teacher Dashboard — Fix (TeacherDashboard.jsx)

| Change | Detail |
|--------|--------|
| REMOVE | "Books Issued" card |
| UPDATE | Today's Schedule — filter: `timetable.slots` where `teacherId === currentTeacher.uid` AND `day === today` |
| ADD | Pending Marks Entry count card |
| ADD | Upcoming exams for teacher's classes |

**Today's Schedule logic:**
```js
const todaySchedule = timetable.slots.filter(
  slot => slot.day === getCurrentDayName() && slot.teacherId === currentTeacher.uid
);
// Show free periods explicitly
```

### 4.9 Student Dashboard — Fix (StudentDashboard.jsx)

| Change | Detail |
|--------|--------|
| REMOVE | "Books Issued" card |
| UPDATE | Timetable widget — published timetable for student's `currentClassId`, filter today's slots |
| UPDATE | Attendance % card — from actual attendanceRecords, green ≥85%, red <85% |
| ADD | Low attendance warning banner if below threshold |
| ADD | Upcoming exams section |
| UPDATE | Fee status card — check feePayments for this student for current month → "Paid ✓" (green) or "Due ✗" (red) |
| UPDATE | Class Rank — from exam marks data (not hardcoded) |

### 4.10 Student Sub-pages — Final Fix

**Student Attendance (/dashboard/student/attendance):**
- Monthly calendar grid with colored dots
- Month navigation prev/next
- Legend: 🟢 Present 🔴 Absent 🟡 Late 🔵 Medical Leave ⬜ Holiday/Sunday
- Subject-wise breakdown table
- Low attendance warning if below threshold

**Student Report Cards (/dashboard/student/report-cards):**
- 3 cards: Mid Term 1 | Mid Term 2 | Final Exam
- LOCKED state: grey card, padlock icon, "Results Pending — Marks being entered..."
- UNLOCKED state: colorful card, Overall %, Grade, Rank, [View Full Card] [Download PDF]
- View Full Card → modal with ReportCard component
- Download PDF → html2canvas + jsPDF of ReportCard

**Student Fee History (/dashboard/student/fees):**
- Own payments only
- Outstanding dues (red alert)
- If custom plan: "Next installment: ₹{amount} due {date}"
- Table: Date | Receipt No | Fee Type | Period | Amount | Mode | [Download Receipt]

**Student ID Card (/dashboard/student/id-card):**
- Shows own StudentIDCard preview (pre-populated)
- [Download My ID Card] button
- [Download Escort Pass] button (GuardianEscortPass component)

### 4.11 Sprint 4 Completion Criteria
- [ ] LC: search student, fill form, preview LCDocument, issue LC updates student isActive=false, download PDF works
- [ ] LC revoke restores student, sets LC status='Cancelled' (record kept)
- [ ] LC number format correct: `LC-SBIS-2425-0001`
- [ ] Student ID card shows correct header color (blue/red) and correct school name (LKG/UKG vs 1–8)
- [ ] Faculty ID card always has white header
- [ ] Guardian Escort Pass always has green header
- [ ] Bulk download generates all cards in selected class into single PDF
- [ ] Report card renders correctly, PDF download works
- [ ] Bulk Promotion: hold back works, UKG→1 updates school brand, class 8 graduates
- [ ] Calendar: holidays marked red, Sundays grey, add/edit/delete works
- [ ] Settings saves each section independently, changes reflect across components (school name, principal name etc.)
- [ ] Teacher dashboard: no Books Issued, today's schedule from timetable data only
- [ ] Student dashboard: no Books Issued, real attendance %, real fee status, upcoming exams visible
- [ ] Student report card locked/unlocked state correct
- [ ] All 3 student sub-pages (attendance, fees, id-card) functional

---

## Global Rules — Apply Every Sprint

> Paste these at the start of every Antigravity/Cursor session.

```
CRITICAL RULES — Shree Bala SMS:

1. GR Number = primary key for students. NEVER auto-generate. NEVER use phone/email as key.
2. Roll Number = manually entered. Never auto-generated.
3. getSchoolBrand(standard): LKG/UKG → 'Shiv Dhara School', 1–8 → 'Shree Bala International School'. Use EVERYWHERE.
4. ID card header: English medium = Blue #1A5276 | Gujarati medium = Red #922B21.
5. Guardian Escort Pass header: ALWAYS Green #1E8449.
6. Faculty ID card header: ALWAYS White/plain.
7. LC issue → isActive=false, status='Left'. NEVER delete student data.
8. LC revoke → status='Cancelled'. NEVER delete LC record.
9. Attendance: NEVER show isActive=false students in marking form.
10. Report card LOCKED until ALL exam.subjects have marksSubmitted=true.
11. Teacher submits marks ONCE — no edits after submit.
12. Only 3 exam names: Mid Term 1 | Mid Term 2 | Final Exam.
13. Timetable = manual build only. NO auto-generator.
14. Conflict check = WARNING toast only. NEVER block admin from saving timetable slot.
15. Only published timetables (isPublished=true) visible to teacher/student.
16. Salary visible ONLY in teacher detail modal — never on table, never on dashboard.
17. Library is REMOVED. No Library page, no books data, no Books Issued card anywhere.
18. DO NOT touch LandingPage.jsx.
19. Use react-hot-toast for notifications. NEVER use browser alert().
20. No bell/notification icon needed.
```

---

## Dependency Map (Build Order)

```
Sprint 1 (Foundation) → Sprint 2 (People + Classes) → Sprint 3 (Operations) → Sprint 4 (Documents)
     ↓                        ↓                              ↓                        ↓
AuthContext               DataContext fully                Timetable uses          LC reads students
DataContext shape          populated                       Classes data            ID cards read
Routing                   getSchoolBrand()               Attendance reads         teachers/students
Sidebar                   all wired                       students.isActive       Report card reads
ProtectedRoute                                            Fees reads students     exams.marksSubmitted
mockData files                                            Exams read classes      Bulk promotion reads
                                                          Notices read roles      all students
```

---

## Quick File Count

| Sprint | New Files | Modified Files | Deleted Files |
|--------|-----------|----------------|---------------|
| S1 | 8 (mockUsers, mockAcademicYears, mockClasses, mockDashboard, DataContext shape, ProtectedRoute, ConfirmDialog, StatusBadge, EmptyState, SchoolBrandBadge, schoolBrand util) | 5 (LoginPage, AuthContext, DataContext, Sidebar, App.jsx) | 0 |
| S2 | 2 (Classes.jsx, AcademicYears.jsx) | 5 (AdminDashboard, Students, Teachers, mockStudents, mockTeachers) | 0 |
| S3 | 1 (TimetableGrid.jsx) | 8 (Timetable, Attendance, TeacherAttendance, Fees, FeeReceipt, Examinations/Results, MarksEntry, Notices) | 0 |
| S4 | 8 (LCGenerator, LCDocument, FacultyIDCard, GuardianEscortPass, ReportCard, BulkPromotion, Calendar, lcGenerator util, reportCardGenerator util) | 8 (IDCards, StudentIDCard, Settings, TeacherDashboard, StudentDashboard, StudentAttendance, StudentReportCards, StudentFees) | 2 (Library.jsx, books.js) |

---

*Shree Bala International School SMS — Sprint Plan v1.0*
*Based on Frontend PRD v3.0 | React 19 + Vite + Tailwind CSS*
