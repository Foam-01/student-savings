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
