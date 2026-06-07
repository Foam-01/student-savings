# 📦 Student Savings System

A full-stack Web Application designed to manage and promote financial literacy and savings habits among students in schools or classrooms. Built with a modern tech stack, the system supports QR Code scanning for instant transactions, a multi-bucket budgeting framework (Envelope System), and an intelligent, data-driven financial advice generator (Smart Insights Engine).

---

## 📋 Key Features

### 1. Core Banking & QR Code Transaction Management
- **Student Profiling:** Teachers and administrators can add new students, update profiles, search, and filter student records by classroom.
- **Deposit & Withdrawal Logging:** Effortlessly record deposit and withdrawal entries for individual students with custom transaction descriptions.
- **Personal Student QR Codes:** Every student profile is equipped with a unique QR Code. Teachers can instantly scan these codes using a camera to pull up student data and perform transactions in seconds.
- **Executive Analytics Dashboard:** Offers real-time visibility into total accumulated school savings, total student count, and interactive transaction history charts.

### 2. Envelope System / Savings Buckets 🗂️
- **Targeted Budgeting:** Students can break down their main balance into custom sub-accounts (buckets) to separate their savings by intent, avoiding a single unallocated pool of cash.
- **3 Core Pre-configured Buckets:**
  1. *Education 📚 (50%):* Reserved for learning materials, textbooks, art tools, and school supplies.
  2. *Dreams & Hobbies 🎮 (30%):* Allocated for toys, rewards, video games, or personal wishes.
  3. *Emergency & Essentials 🩺 (20%):* Set aside for unexpected events, medical expenses, or urgent needs.
- **50/30/20 Auto-Allocation:** An automated feature allowing students to distribute their unallocated main balance into the 3 core preset buckets using a popular finance rule in a single click.
- **Budgeting Simulator:** A sandbox calculator where students can input hypothetical amounts to see how the 50/30/20 distribution splits before committing real funds.
- **Internal Ledger Transfers:** Seamlessly transfer money back and forth between the main savings account and specific sub-buckets (Allocate / Deallocate).
- **Custom Buckets:** Create tailored sub-buckets by selecting names, descriptions, and personalized icons (e.g., Books, Games, Health, Goals, Shopping, Gifts, Travel, Family, Activities).
- **Teacher Monitor (Read-Only):** Teachers can look up individual student profiles to monitor budgeting distributions and saving habits for mentoring purposes.

### 3. Saving Goals 🎯
- **Long-Term Milestone Management:** Students can define personal long-term financial milestones, setting exact target amounts, descriptions, and deadline dates.
- **Progress Visualization:** Features real-time percentage progress bars comparing actual accumulated bucket funds against the defined target goals.
- **Advisory Tracking:** Teachers/Admins can view and review student goals to offer practical financial advice and guidance.

### 4. Smart Financial Insights & Assistant 🤖
- **Automated Insights Engine:** Evaluates transaction logs and milestones in real-time to generate smart data points directly onto the student's dashboard:
  1. *Goal Projection:* Calculates if a milestone will be achieved by its deadline based on past saving frequency, stating the exact average daily top-up needed if behind schedule.
  2. *Savings Streak:* Tracks and highlights consecutive weekly deposits to boost morale and reinforce positive saving behaviors.
  3. *Withdrawal Alert:* Generates a balance warning if the total amount withdrawn over the trailing 30 days exceeds 50% of total deposits.
  4. *Compound Interest Forecast:* Simulates a 3-year compound interest growth path using a dividend projection model to demonstrate the power of time and investment.

### 5. Competitive Leaderboard & Financial Tools 🏆🧮
- **Top Savers Leaderboard:** Displays a gamified school-wide or classroom-wide ranking of top savers to cultivate constructive competition.
- **Interest Calculator:** An interactive tool to project future savings dividends and compound growth by adjusting periods and interest rates, populated with yearly growth data tables and visual charts.

### 6. Security & Log Management 🛡️
- **Audit Activity Log:** Automatically keeps a record of all critical events triggered by students and teachers—including logins, QR scans, and transactions—mapped with client IP addresses for complete accountability.
- **In-App Notification Center:** A dedicated bell icon alert system notifying users of successful transactions, transfers, or account security events.

---

## 🔧 Tech Stack

### 💻 Backend (.NET 8 Web API)
- **Framework:** .NET 8.0 SDK (C#)
- **ORM:** Entity Framework Core (EF Core)
- **Database:** PostgreSQL via Npgsql Client Library
- **Authentication:** JWT Bearer Token (JSON Web Tokens)
- **API Documentation:** Swagger / OpenAPI UI

### 🎨 Frontend (React)
- **Framework:** React 18 powered by Vite Bundler
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios with centralized Authorization Token Interceptors
- **Styling:** Bootstrap 5 blended with Custom Vanilla CSS for premium gradients and glassmorphism styling
- **Data Visualization:** Chart.js + react-chartjs-2
- **Popups & Dialogs:** SweetAlert2
- **Icon Pack:** Lucide React Icons
- **Utilities:** QRCode.react for programmatic client-side QR generation

---

## 📁 Detailed Project File Tree

StudentSavingsSystem/
├── Backend/
│   ├── Controllers/
│   │   ├── ActivityController.cs             # Manages system audit logs
│   │   ├── AuthController.cs                 # Handles login, registration, and tokens
│   │   ├── FinancialAdvisorController.cs     # Serves automated behavior insights
│   │   ├── LeaderboardController.cs          # Controls top saver rankings
│   │   ├── NotificationController.cs         # Handles in-app alerts and histories
│   │   ├── ReportsController.cs              # Generates financial statement summaries
│   │   ├── SavingGoalController.cs           # Handles student financial milestones
│   │   ├── SavingsBucketController.cs        # Manages multi-bucket budgeting accounts
│   │   ├── SearchController.cs               # Controls multi-entity cross-searching
│   │   ├── SettingsController.cs             # Manages global application controls
│   │   └── TransactionController.cs          # Handles deposits, withdrawals, and student profiles
│   ├── Data/
│   │   ├── DbInitializer.cs                  # Set up and structural initializers
│   │   └── SeedDataExpansion.cs              # Mock data expansions for demo students and buckets
│   ├── DTOs/
│   │   ├── Activity/
│   │   │   └── ActivityLogDto.cs
│   │   ├── Auth/
│   │   │   ├── LoginRequestDto.cs
│   │   │   ├── LoginResponseDto.cs
│   │   │   └── RegisterRequestDto.cs
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboardDto.cs
│   │   │   └── StudentDashboardDto.cs
│   │   ├── FinancialInsights/
│   │   │   └── FinancialInsightDto.cs
│   │   ├── Leaderboard/
│   │   │   └── LeaderboardEntryDto.cs
│   │   ├── Notification/
│   │   │   └── NotificationDto.cs
│   │   ├── Reports/
│   │   │   ├── TransactionReportDto.cs
│   │   │   └── TransactionSummaryDto.cs
│   │   ├── SavingGoal/
│   │   │   └── SavingGoalDtos.cs
│   │   ├── SavingsBucket/
│   │   │   └── SavingsBucketDtos.cs
│   │   ├── Search/
│   │   │   └── SearchResultDto.cs
│   │   ├── Settings/
│   │   │   └── SystemSettingsDto.cs
│   │   ├── Transaction/
│   │   │   ├── TransactionRequestDto.cs
│   │   │   └── TransactionResponseDto.cs
│   │   └── User/
│   │       ├── StudentDto.cs
│   │       └── UpdateStudentDto.cs
│   ├── Helpers/
│   │   ├── HttpContextExtensions.cs          # Utility class to parse client IP addresses
│   │   └── UserMapper.cs                     # Mapping configurations converting entities to DTOs
│   ├── Migrations/                            # Entity Framework database schema histories
│   ├── Models/
│   │   ├── Entities/
│   │   │   ├── ActivityLog.cs                # Audit action log database scheme
│   │   │   ├── Notification.cs               # Alert messaging database scheme
│   │   │   ├── SavingGoal.cs                 # Savings targets database scheme
│   │   │   ├── SavingsBucket.cs              # Sub-bucket envelope database scheme
│   │   │   ├── SystemSetting.cs              # Central app configuration scheme
│   │   │   ├── Transaction.cs                # Core ledger ledger entry database scheme
│   │   │   └── User.cs                       # Accounts and authentication profile database scheme
│   │   └── ApplicationDbContext.cs           # Database context binding relational models
│   ├── Services/
│   │   ├── ActivityLogService.cs             # Implements audit logging logics
│   │   ├── AuthService.cs                    # Implements validation and JWT generation
│   │   ├── FinancialInsightsService.cs       # Implements automated analytics logic
│   │   ├── IActivityLogService.cs
│   │   ├── IAuthService.cs
│   │   ├── IFinancialInsightsService.cs
│   │   ├── ILeaderboardService.cs
│   │   ├── INotificationService.cs
│   │   ├── ISavingGoalService.cs
│   │   ├── ISavingsBucketService.cs
│   │   ├── ISearchService.cs
│   │   ├── ISettingsService.cs
│   │   ├── ITransactionService.cs
│   │   ├── LeaderboardService.cs             # Implements ranking sorting rules
│   │   ├── NotificationService.cs            # Implements alert delivery rules
│   │   ├── SavingGoalService.cs              # Implements target milestone logics
│   │   ├── SavingsBucketService.cs           # Implements ledger allocations/deallocations
│   │   ├── SearchService.cs                  # Implements global unified searching logic
│   │   ├── SettingsService.cs                 # Implements parameters override logics
│   │   └── TransactionService.cs             # Implements deposit/withdrawal atomic ledgers
│   ├── Program.cs                            # Main entry point configuring and bootstrapping the API
│   ├── StudentSavingsSystem.csproj
│   └── appsettings.json
└── Frontend/
├── src/
│   ├── config/
│   │   └── apiClient.js                  # Axios client setting interceptors and base configurations
│   ├── contexts/
│   │   └── AuthContext.jsx               # Context preserving user roles and authentication state
│   ├── components/
│   │   ├── FinancialInsights/
│   │   │   └── FinancialInsights.jsx     # Swiper carousel displaying smart advices
│   │   ├── Modal/
│   │   │   └── TransactionModal.jsx      # Popup modal to execute deposit/withdraw operations
│   │   ├── Notifications/
│   │   │   └── NotificationSystem.jsx    # Popover listing historical alerts
│   │   └── Search/
│   │       └── GlobalSearch.jsx          # Omni-search field combining entity results
│   ├── layouts/
│   │   ├── MainLayout.jsx                # Layout wrapper housing the Sidebar, Header, and Content
│   │   └── AuthLayout.jsx                # Gateway layout wrapping login operations
│   ├── pages/
│   │   ├── Home/
│   │   │   └── Dashboard.jsx             # Main landing metrics and charting workspace
│   │   ├── Students/
│   │   │   └── Students.jsx              # Dashboard listing and editing student rosters
│   │   ├── Transactions/
│   │   │   └── Transactions.jsx          # Interface managing banking ledger executions
│   │   ├── SavingGoals/
│   │   │   └── SavingGoals.jsx           # Section tracking personal savings targets
│   │   ├── SavingsBuckets/
│   │   │   └── SavingsBuckets.jsx        # Budgeting workspace (Envelope System manager)
│   │   ├── Leaderboard/
│   │   │   └── Leaderboard.jsx           # Grid showcasing high-ranking saving accounts
│   │   ├── InterestCalculator/
│   │   │   └── InterestCalculator.jsx    # Simulation graphs testing dividend yields
│   │   ├── ActivityLog/
│   │   │   └── ActivityLog.jsx           # Audit history reporting client footprints and IPs
│   │   ├── Settings/
│   │   │   └── Settings.jsx              # Parameters adjustments interface for teachers
│   │   ├── Login/
│   │   │   └── Login.jsx                 # Secure login entry portal
│   │   ├── MyQR/
│   │   │   └── MyQR.jsx                  # Renders individual student QR passports
│   │   └── Help/
│   │       └── Help.jsx                  # FAQ and information desk workspace
│   ├── App.jsx                           # Core React app declaring router configurations
│   ├── index.css                         # Global CSS theme and design system
│   └── main.jsx                          # Root file rendering the React Virtual DOM
├── package.json
├── vite.config.js
└── index.html

## 🔐 Default Credentials

The API automatically seeds mock runtime entities into the database on its initial launch. Use the following profiles for evaluation:

| User Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Teacher / Admin** | `admin` | `admin123` | Full administrative rights (Deposits, Withdrawals, Student Profiling, Configurations) |
| **Demo Student** | `student1` to `student5` | `student123` | e.g., `student1` (View histories, allocate buckets, map milestones) |

*(Note: New student profiles can be registered dynamically via the "Manage Students" panel when logged in as an Admin)*

---

## 📝 Major API Endpoints

### 🔑 Authentication System
- `POST /api/auth/login` - Authenticates profile and yields a valid JWT Bearer Token.
- `GET /api/auth/me` - Resolves identity records of the currently authenticated token bearer.

### 💳 Banking Ledgers & Student Administration
- `POST /api/transaction/create` - Submits a deposit or withdrawal entry for a specific student (Admin only).
- `GET /api/transaction/recent` - Retrieves school-wide trailing ledger entries.
- `GET /api/transaction/student/{id}` - Returns historical transactions tied to an isolated student ID.
- `GET /api/transaction/dashboard` - Fetches aggregated sums, saving averages, and active system counts.
- `POST /api/transaction/student/create` - Registers an individual student record into the system database.
- `GET /api/transaction/students` - Fetches all registered student entities.
- `GET /api/transaction/student/by-qr/{qrCode}` - Performs a lookup to resolve a student identity from a parsed QR hash.

### 🗂️ Savings Buckets (Budgeting Framework)
- `GET /api/savingsbucket/summary` - Provides distributed metrics across main and sub-bucket allocations (Student-view).
- `GET /api/savingsbucket/summary/{studentId}` - Grants cross-profile visibility into budgeting metrics (Admin-view).
- `POST /api/savingsbucket` - Maps and generates a brand new sub-bucket target folder.
- `PUT /api/savingsbucket/{bucketId}` - Overrides label parameters, descriptions, or design elements of a bucket.
- `DELETE /api/savingsbucket/{bucketId}` - Deletes a sub-bucket (Remaining balances automatically fall back into the primary account).
- `POST /api/savingsbucket/{bucketId}/transfer` - Moves funds across primary wallets and targeted sub-buckets (Allocate / Deallocate).
- `POST /api/savingsbucket/auto-allocate` - Triggers a mathematical split applying a 50/30/20 budget matrix rule.

### 🤖 Advisory Services & Analysis
- `GET /api/financialadvisor/insights` - Generates algorithmic performance reviews and recommendations (Student-view).
- `GET /api/financialadvisor/insights/{studentId}` - Grants predictive behavioral reports on targeted students (Teacher-view).

### 🎯 Milestone Target Systems
- `GET /api/savinggoal/student/{studentId}` - Lists historical and active milestone objectives assigned to a student.
- `POST /api/savinggoal` - Formulates a brand new capital acquisition milestone target.
- `PUT /api/savinggoal/{id}` - Updates criteria or structural properties of an active target.
- `DELETE /api/savinggoal/{id}` - Erases an objective flag from the workspace.

### 🏆 Gamified Rankings
- `GET /api/leaderboard` - Sorts and yields profiles holding high aggregated financial savings metrics.

---

## 🎨 System Customization

### Administrative Overrides
Administrators can configure compound interest multipliers, school-wide notifications, and ticker notices through the **"System Settings"** interface. Modifying these records updates properties mapped to the `SystemSettings` entity model in real-time.

### Local Configuration Files
Default connection parameters, fallback keys, and systemic presets are stored directly inside `Backend/appsettings.json`.

---

## 📄 License

Copyright © 2026 Student Savings System. All rights reserved.

## 👨‍💻 Developers

Developed with ❤️ by Sitthidech Thongsawang (Foam)
