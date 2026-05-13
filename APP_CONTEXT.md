# Complete App Context Documentation

## Project Overview
A **QR Code-Based Student Attendance System** built with Next.js, TypeScript, and Prisma. The system allows:
- Students to mark attendance by scanning QR codes
- Teachers/Admins to generate QR codes and manage classes
- Dashboard for viewing attendance statistics and records
- CSV import/export functionality for student management

---

## Tech Stack
- **Framework**: Next.js 16.2.4
- **Language**: TypeScript 5.7.3
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS 4.2.0
- **Forms**: React Hook Form + Zod validation
- **QR Code**: qrcode.react, html5-qrcode
- **Notifications**: Sonner
- **State Management**: React Hooks + localStorage
- **Analytics**: Vercel Analytics

---

## Database Schema

### Model: Class
Represents a class/section with students and attendance records.
```
- id: String (CUID, Primary Key)
- name: String (Unique)
- teacher: String
- createdAt: DateTime
- updatedAt: DateTime
- Relations:
  - students: Student[] (One-to-Many)
  - attendance: Attendance[] (One-to-Many)
  - qrSessions: QRSession[] (One-to-Many)
```

### Model: Student
Individual student records with attendance history.
```
- id: String (CUID, Primary Key)
- name: String
- rollNumber: String
- parentEmail: String? (Optional)
- remarks: String? (Optional)
- createdAt: DateTime
- classId: String? (Foreign Key)
- Relations:
  - class: Class? (Many-to-One)
  - attendance: Attendance[] (One-to-Many)
- Unique Constraint: rollNumber + classId
```

### Model: Attendance
Records of student attendance for each class session.
```
- id: String (CUID, Primary Key)
- studentId: String (Foreign Key)
- classId: String (Foreign Key)
- date: String (YYYY-MM-DD format)
- time: String (HH:MM format)
- timestamp: DateTime (auto-generated)
- sessionType: String ("session" | "exam")
- status: String ("present" | "absent" | "late")
- createdAt: DateTime
- updatedAt: DateTime
- Relations:
  - student: Student (Many-to-One)
  - class: Class (Many-to-One)
- Unique Constraint: studentId + classId + date
```

### Model: QRSession
Temporary QR sessions with expiration for attendance marking.
```
- id: String (CUID, Primary Key)
- classId: String (Foreign Key)
- sessionType: String ("session" | "exam")
- expiresAt: DateTime
- createdAt: DateTime
- Relations:
  - class: Class (Many-to-One)
```

---

## Project Structure

```
project-root/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page (login)
│   ├── api/                     # API routes
│   │   ├── attendance/          # Attendance endpoints
│   │   │   └── route.ts
│   │   ├── classes/             # Class management endpoints
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── students/            # Student management endpoints
│   │   │   ├── route.ts
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── export/
│   │   │   │   └── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── qr-sessions/         # QR session endpoints
│   │       └── route.ts
│   ├── student/
│   │   └── page.tsx             # Student attendance page
│   ├── admin/
│   │   └── page.tsx             # Admin dashboard
│   └── dashboard/
│       └── page.tsx             # Analytics & stats dashboard
├── components/                   # React components
│   ├── ui/                      # Radix UI + custom components
│   ├── student-login.tsx        # Student login form
│   ├── qr-generator.tsx         # QR code generation
│   ├── qr-scanner.tsx           # QR code scanning
│   ├── student-manager.tsx      # Student CRUD
│   ├── class-manager.tsx        # Class CRUD
│   ├── attendance-stats.tsx     # Attendance statistics
│   ├── attendance-records.tsx   # Attendance records table
│   └── theme-provider.tsx       # Theme configuration
├── hooks/                        # Custom React hooks
│   ├── use-toast.ts
│   └── use-mobile.ts
├── lib/                          # Utility functions & helpers
│   ├── utils.ts                 # Tailwind class merger
│   ├── prisma-client.ts         # Prisma client singleton
│   └── students-csv.ts          # CSV parsing utilities
├── scripts/                      # Build/utility scripts
│   ├── export-students-csv.ts   # Export students to CSV
│   └── import-students-csv.ts   # Import students from CSV
├── prisma/                       # Database schema
│   ├── schema.prisma            # Prisma schema definition
│   └── seed.ts                  # Database seeding script
├── styles/                       # Global styles
│   └── globals.css
├── public/                       # Static assets
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

---

## Pages & Routes

### Page: Home (`/`)
**File**: `app/page.tsx`

**Purpose**: Main landing page with authentication

**Key Functions**:
- `Home()` - Main component
- `handleLogin(name, rollNumber)` - Process student login
- `handleLogout()` - Clear session and logout
- `isAdminCredentials(name, rollNumber)` - Check admin credentials

**Features**:
- Student login form
- Admin detection (hardcoded: "admin@harshit" / "9630511058")
- Session management in localStorage
- Navigation to student page or admin panel

**Session Structure**:
```typescript
interface UserSession {
  name: string;
  rollNumber: string;
  isAdmin?: boolean;
}
```

---

### Page: Student Attendance (`/student`)
**File**: `app/student/page.tsx`

**Purpose**: QR code scanning interface for students

**Key Functions**:
- `StudentPage()` - Main component
- `handleLogin(name, rollNumber)` - Set session for student
- `handleScanSuccess(payload)` - Process scanned QR code
- `handleLogout()` - Clear student session

**Features**:
- QR scanner with camera access
- Real-time attendance recording
- Success/failure feedback
- Device-specific session locking

**Workflow**:
1. Student logs in
2. Camera QR scanner loads
3. Student scans QR code
4. System validates attendance
5. Shows success confirmation

---

### Page: Admin Panel (`/admin`)
**File**: `app/admin/page.tsx`

**Purpose**: Administrative interface for class and student management

**Key Functions**:
- `AdminPage()` - Main component with tabs
- `fetchClasses()` - Load all classes
- `handleClassAdded(newClass)` - Update class list
- `handleClassUpdated(updatedClass)` - Update existing class
- `handleClassDeleted(classId)` - Remove class from list

**Tabs**:
1. **Generate QR** - Create attendance QR codes
2. **Manage Classes** - CRUD operations on classes
3. **Students** - Manage student roster

**Features**:
- Class CRUD operations
- QR code generation with expiry
- Student roster management
- CSV import/export

---

### Page: Dashboard (`/dashboard`)
**File**: `app/dashboard/page.tsx`

**Purpose**: Analytics and attendance records viewing

**Key Functions**:
- `DashboardPage()` - Main component
- `fetchAttendanceRecords()` - Load attendance data
- `fetchClasses()` - Load class information
- `handleRefresh()` - Refresh all data

**Tabs**:
1. **Statistics** - Attendance charts and analytics
2. **Records** - Detailed attendance table with filtering

**Features**:
- Attendance statistics visualization
- Records table with filtering/sorting
- Summary statistics (total records, classes, unique students)
- Data export as CSV

---

## Components

### Component: StudentLogin
**File**: `components/student-login.tsx`

**Props**:
```typescript
interface StudentLoginProps {
  onLogin: (name: string, rollNumber: string) => void;
  bypassRosterValidation?: (name: string, rollNumber: string) => boolean;
}
```

**Key Functions**:
- `handleSubmit(e)` - Validate and submit login
- Calls `/api/students/login` to validate credentials
- Supports bypass validation (for admin)

**Features**:
- Name and roll number input fields
- Client-side validation
- Server-side student roster validation
- Error feedback

---

### Component: QRGenerator
**File**: `components/qr-generator.tsx`

**Props**:
```typescript
interface QRGeneratorProps {
  classes: Class[];
}
```

**Key Functions**:
- `generateQRCode()` - Create QR session and payload
- `downloadQRCode()` - Save QR as PNG image
- `printQRCode()` - Print QR code
- `formatTime(seconds)` - Format countdown timer

**Features**:
- Class selection dropdown
- Session type selection (Regular/Exam)
- Expiry time configuration (5-60 minutes)
- Live countdown timer
- QR code download/print functionality
- Responsive sizing

**QR Payload Format**:
```
v1|<classId>|<sessionType>|<expiresAtMs>
```

---

### Component: QRScanner
**File**: `components/qr-scanner.tsx`

**Props**:
```typescript
interface QRScannerProps {
  onScanSuccess: (payload: any) => void;
  studentName: string;
  rollNumber: string;
}
```

**Key Functions**:
- `startScanning()` - Initialize camera and QR decoder
- `stopScannerIfRunning()` - Clean shutdown of scanner
- `handleRetry()` - Restart scanning after error
- Payload validation and expiry check

**Features**:
- Html5Qrcode library integration
- Environment-facing camera
- Automatic QR code detection
- Payload parsing (v1 format and JSON)
- Expiry validation
- Single-scan protection (prevents duplicate processing)

**Supported QR Formats**:
```
Format 1: v1|classId|sessionType|expiresAtMs
Format 2: JSON {classId, sessionType, expiresAt}
```

---

### Component: StudentManager
**File**: `components/student-manager.tsx`

**Purpose**: CRUD operations for student roster

**Key Features**:
- Add new students
- View student list
- Edit student details (parentEmail, remarks)
- Delete students
- CSV import/export
- Filter by class

---

### Component: ClassManager
**File**: `components/class-manager.tsx`

**Purpose**: Manage classes and sections

**Key Features**:
- Create new classes
- Edit class details
- Delete classes
- View assigned students
- Assign students to classes

---

### Component: AttendanceStats
**File**: `components/attendance-stats.tsx`

**Purpose**: Display attendance statistics and charts

**Key Features**:
- Attendance by class pie chart
- Attendance rate statistics
- Top attendees
- Session type breakdown

---

### Component: AttendanceRecords
**File**: `components/attendance-records.tsx`

**Purpose**: Display detailed attendance records

**Key Features**:
- Sortable/filterable table
- Filter by date, class, student, status
- Export records as CSV
- Show all 11 fields for n8n integration

---

## API Routes

### Route: POST /api/students/login
**File**: `app/api/students/login/route.ts`

**Purpose**: Validate student credentials

**Request Body**:
```typescript
{
  name: string;
  rollNumber: string;
}
```

**Response** (200):
```typescript
{
  id: string;
  name: string;
  rollNumber: string;
  parentEmail: string | null;
  remarks: string | null;
  createdAt: string;
}
```

**Error Responses**:
- `400`: Missing required fields
- `403`: Student not found
- `500`: Server error

---

### Route: GET /api/students
**File**: `app/api/students/route.ts`

**Purpose**: Get all unassigned students

**Query Parameters**: None

**Response** (200):
```typescript
Array<{
  id: string;
  name: string;
  rollNumber: string;
  parentEmail: string | null;
  remarks: string | null;
  createdAt: string;
}>
```

---

### Route: POST /api/students
**File**: `app/api/students/route.ts`

**Purpose**: Create new student

**Request Body**:
```typescript
{
  name: string;
  rollNumber: string;
  parentEmail?: string;
  remarks?: string;
}
```

**Response** (201):
```typescript
{
  id: string;
  name: string;
  rollNumber: string;
  parentEmail: string | null;
  remarks: string | null;
  createdAt: string;
}
```

**Error Responses**:
- `400`: Missing name or roll number
- `409`: Student with same roll number exists
- `500`: Server error

---

### Route: POST /api/attendance
**File**: `app/api/attendance/route.ts`

**Purpose**: Record student attendance

**Request Body**:
```typescript
{
  studentId: string;           // roll number
  studentName: string;
  classId: string;
  className: string;
  teacher: string;
  sessionType: string;         // "session" or "exam"
  date: string;                // YYYY-MM-DD
  time?: string;               // HH:MM
  status?: string;             // default: "present"
}
```

**Response** (201):
```typescript
{
  id: string;
  studentId: string;           // roll number
  studentName: string;
  classId: string;
  className: string;
  teacher: string;
  session: string;             // sessionType
  date: string;
  time: string;
  timestamp: string;           // ISO format
  status: string;
}
```

**Error Responses**:
- `400`: Missing required fields
- `403`: Student not approved for class
- `409`: Attendance already recorded for this date
- `500`: Server error

---

### Route: GET /api/attendance
**File**: `app/api/attendance/route.ts`

**Purpose**: Fetch attendance records with optional filtering

**Query Parameters**:
- `classId?`: string
- `date?`: string (YYYY-MM-DD)
- `studentId?`: string (roll number)
- `format?`: "csv" | "json" (default: json)

**Response** (200):
```typescript
// JSON format
Array<{
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  teacher: string;
  session: string;
  date: string;
  time: string;
  timestamp: string;
  status: string;
}>

// CSV format
CSV file with same 11 columns
```

---

### Route: POST /api/qr-sessions
**File**: `app/api/qr-sessions/route.ts`

**Purpose**: Create a new QR session for attendance marking

**Request Body**:
```typescript
{
  classId: string;
  sessionType: string;         // "session" | "exam"
  expiryMinutes?: number;      // default: 10
}
```

**Response** (201):
```typescript
{
  session: {
    id: string;
    classId: string;
    sessionType: string;
    expiresAt: string;         // ISO format
    createdAt: string;
    class: Class;
  };
  qrPayload: string;          // "v1|classId|sessionType|expiresAtMs"
}
```

**Error Responses**:
- `400`: Missing required fields
- `404`: Class not found
- `500`: Server error

---

### Route: GET /api/qr-sessions
**File**: `app/api/qr-sessions/route.ts`

**Purpose**: Fetch QR sessions

**Query Parameters**:
- `classId?`: string

**Response** (200):
```typescript
Array<{
  id: string;
  classId: string;
  sessionType: string;
  expiresAt: string;
  createdAt: string;
  class: Class;
}>
```

---

### Route: GET /api/classes
**File**: `app/api/classes/route.ts`

**Purpose**: Fetch all classes

**Response** (200):
```typescript
Array<{
  id: string;
  name: string;
  teacher: string;
  createdAt: string;
  updatedAt: string;
}>
```

---

### Route: POST /api/classes
**File**: `app/api/classes/route.ts`

**Purpose**: Create a new class

**Request Body**:
```typescript
{
  name: string;
  teacher: string;
}
```

**Response** (201):
```typescript
{
  id: string;
  name: string;
  teacher: string;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses**:
- `400`: Missing name or teacher
- `409`: Class with same name exists
- `500`: Server error

---

## Utility Functions

### Function: cn() 
**File**: `lib/utils.ts`

**Purpose**: Merge Tailwind CSS classes safely

**Implementation**:
```typescript
function cn(...inputs: ClassValue[]): string
```

**Uses**: `clsx` + `tailwind-merge` to handle class conflicts

---

### Function: normalize()
**File**: `app/api/students/route.ts`

**Purpose**: Normalize string input (trim, collapse whitespace)

**Implementation**:
```typescript
function normalize(value: string): string
```

---

## Scripts

### Script: export-students-csv.ts
**File**: `scripts/export-students-csv.ts`

**Purpose**: Export all students to CSV file

**Command**: `npm run students:export`

**Features**:
- Exports all students from database
- Creates CSV file with headers
- Saves to `students-export.csv`

---

### Script: import-students-csv.ts
**File**: `scripts/import-students-csv.ts`

**Purpose**: Import students from CSV file

**Command**: `npm run students:import`

**CSV Format**:
```
name,rollNumber,parentEmail,remarks
John Doe,STU001,john@parent.com,Notes here
```

**Features**:
- Reads CSV from `students-import.csv`
- Validates data
- Bulk inserts into database
- Skips duplicates
- Detailed error reporting

---

## Authentication & Authorization

### Admin Credentials (Hardcoded)
```
Name: admin@harshit
Roll Number: 9630511058
```

**Security Note**: In production, use proper authentication (JWT, OAuth, etc.)

### Session Storage
- Stored in `localStorage` as `studentSession`
- Contains: `name`, `rollNumber`, `isAdmin` (computed)
- Persists across page reloads

### Session Validation
- Login validates student exists in roster
- Admin can bypass validation
- QR code expiry validated on scan
- Attendance duplicate check prevents double marking

---

## Error Handling

### Client-Side
- Toast notifications via Sonner
- Form validation with React Hook Form + Zod
- User-friendly error messages

### Server-Side
- NextResponse JSON responses with HTTP status codes
- Console error logging
- Prisma error handling
- Validation for all inputs

### QR Code Errors
- Invalid QR payload detection
- Expiry time validation
- Duplicate scan prevention
- Camera access failures

---

## Performance Considerations

### QR Code Optimization
- Compact payload format (v1|...) reduces QR density
- Improves scan speed and reliability
- Single-scan protection prevents race conditions

### Database Queries
- Indexed fields: rollNumber, classId, date
- Unique constraints prevent duplicates
- Cascade deletes for data integrity

### UI Responsiveness
- Mobile-first design
- Adaptive QR size (260px mobile, 360px desktop)
- Lazy loading of components

---

## Deployment Notes

### Environment Variables Required
```
DATABASE_URL=postgresql://user:pass@host:port/db
NODE_ENV=production
```

### Database Setup
```bash
npx prisma migrate deploy
npm run prisma:seed  # Optional: seed initial data
```

### Build & Start
```bash
npm run build
npm start
```

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run students:export` - Export students to CSV
- `npm run students:import` - Import students from CSV

---

## Data Flow Diagrams

### Student Attendance Flow
```
Student Login (/)
    ↓
Enter Credentials
    ↓
API: POST /api/students/login
    ↓
Validate in Database
    ↓
Set localStorage Session
    ↓
Redirect to /student
    ↓
QR Scanner Loads
    ↓
Scan QR Code
    ↓
Parse Payload & Validate Expiry
    ↓
API: POST /api/attendance
    ↓
Create Attendance Record
    ↓
Show Success Confirmation
```

### QR Generation Flow
```
Admin: Generate QR (/admin)
    ↓
Select Class, Type, Expiry
    ↓
API: POST /api/qr-sessions
    ↓
Create QRSession Record
    ↓
Generate Payload: v1|classId|sessionType|expiresAtMs
    ↓
Display QR Code with Countdown
    ↓
Download/Print Options
    ↓
Auto-expire after time elapsed
```

### Dashboard Flow
```
View Dashboard (/dashboard)
    ↓
API: GET /api/attendance
    ↓
API: GET /api/classes
    ↓
Display Statistics (Charts)
    ↓
Display Records (Table)
    ↓
Optional: Export as CSV
```

---

## Frontend State Management

### Home Page (/)
```typescript
session: UserSession | null      // Loaded from localStorage
isLoading: boolean               // Initial load state
```

### Student Page (/student)
```typescript
session: StudentSession | null   // Loaded from localStorage
submitting: boolean              // During attendance submission
success: AttendanceRecord | null // Success state for 3s display
```

### Admin Page (/admin)
```typescript
classes: Class[]                 // All classes
isLoading: boolean              // Data fetch state
```

### Dashboard (/dashboard)
```typescript
records: AttendanceRecord[]     // All attendance records
classes: Class[]                // All classes
isLoading: boolean             // Data fetch state
```

---

## Key Features Summary

✅ **Student Attendance**
- Login with name and roll number
- QR code scanning with camera
- Real-time attendance recording
- Duplicate prevention
- Success confirmation

✅ **QR Code Management**
- Dynamic QR generation
- Configurable expiry (5-60 minutes)
- Download as PNG
- Print functionality
- Live countdown timer

✅ **Admin Dashboard**
- Class CRUD operations
- Student roster management
- CSV import/export
- QR code generation

✅ **Analytics Dashboard**
- Attendance statistics
- Charts and visualizations
- Detailed records table
- Filtering and sorting
- CSV export

✅ **Data Management**
- PostgreSQL database
- Prisma ORM
- Automatic timestamps
- Cascade deletions
- Unique constraints

✅ **User Experience**
- Responsive design (mobile & desktop)
- Dark/light theme support
- Toast notifications
- Smooth animations
- Accessible UI components

---

## Future Enhancements

- Real authentication system (JWT/OAuth)
- Email notifications to parents
- SMS alerts for absences
- Bulk attendance operations
- Biometric integration
- Mobile app (React Native)
- Late marking workflow
- Absent notification system
- Parent dashboard
- Student performance analytics

---

*Last Updated: 2026-05-13*
*Version: 0.1.0*
