# ระบบออมทรัพย์นักเรียน (Student Savings System)

ระบบ Web Application สำหรับจัดการออมทรัพย์นักเรียน พัฒนาด้วย React (Frontend) + .NET 8 Web API (Backend) + PostgreSQL (Database)

## 📋 ฟีเจอร์หลัก (Key Features)

### 1. ระบบจัดการบัญชีธุรกรรม (Core Banking)
- **จัดการนักเรียน:** คุณครู/ผู้ดูแลระบบสามารถเพิ่มรายชื่อนักเรียน ค้นหา แก้ไข และกรองตามห้องเรียนได้
- **บันทึกฝาก-ถอน:** ฝากและถอนเงินสำหรับนักเรียนแต่ละรายพร้อมระบุคำอธิบายรายการ
- **QR Code ประจำตัว:** นักเรียนแต่ละคนมี QR Code ประจำตัว ครูสามารถสแกนเพื่อค้นหาข้อมูลและทำรายการฝาก-ถอนได้ทันที
- **สรุปผลข้อมูลแดชบอร์ด:** แสดงยอดเงินออมสะสมรวม จำนวนนักเรียน และกราฟความเคลื่อนไหวธุรกรรมการเงิน

### 2. ระบบกระปุกออมเงินย่อย (Envelope System / Savings Buckets) 🗂️
- **จัดสรรงบประมาณ (Budgeting):** นักเรียนสามารถแยกประเภทเงินเก็บออกเป็นกระปุกย่อยเพื่อแยกวัตถุประสงค์การใช้เงินแทนการรวมไว้ที่เดียว
- **กระปุกหลักเริ่มต้น 3 หมวดหมู่:**
  1. *เพื่อการเรียน 📚 (50%):* สำหรับอุปกรณ์การเรียน หนังสือ อุปกรณ์ศิลปะ
  2. *ตามล่าความฝัน 🎮 (30%):* สำหรับซื้อของเล่น ของขวัญ เกม สิ่งที่ตนเองอยากได้
  3. *เงินใช้ยามจำเป็น 🩺 (20%):* สำหรับเงินสำรองฉุกเฉิน ยารักษาโรค ค่าใช้จ่ายจำเป็นเร่งด่วน
- **จัดสรรอัตโนมัติ (50/30/20 Presets):** ฟังก์ชันแบ่งยอดเงินออมคงเหลือทั้งหมดเข้าสู่ 3 กระปุกหลักตามสัดส่วนการบริหารเงินยอดนิยมด้วยคลิกเดียว
- **เครื่องจำลองงบประมาณ (Budgeting Simulator):** นักเรียนสามารถทดลองกรอกจำนวนเงินใดๆ เพื่อจำลองการคำนวณสัดส่วน 50/30/20 ก่อนลงมือจัดสรรเงินจริง
- **ระบบโอนเงิน (Transfers):** บริการโอนย้ายเงินระหว่างบัญชีออมทรัพย์หลักและกระปุกออมเงินย่อย (Allocate / Deallocate)
- **สร้างกระปุกย่อยแบบกำหนดเอง:** เลือกเปลี่ยนชื่อ รายละเอียด และไอคอนกระปุกย่อยได้ตามต้องการ (หนังสือ, เกม, สุขภาพ, เป้าหมาย, ช้อปปิ้ง, ของขวัญ, ท่องเที่ยว, บ้าน, กิจกรรม ฯลฯ)
- **มุมมองคุณครู (Teacher Monitor):** คุณครูสามารถค้นหา เลือกดูแผนการจัดสรรกระปุกเงินย่อยและพฤติกรรมการจัดทำงบประมาณของนักเรียนแต่ละคนได้แบบอ่านอย่างเดียว (Read-only)

### 3. ระบบเป้าหมายการออม (Saving Goals) 🎯
- **เป้าหมายระยะยาว:** นักเรียนสามารถกำหนดเป้าหมายการออมส่วนบุคคล ระบุจำนวนเงินเป้าหมาย รายละเอียด และกำหนดเวลาที่คาดว่าจะเก็บเงินได้สำเร็จ
- **ความก้าวหน้าออมเงิน:** แถบเปอร์เซ็นต์คำนวณความคืบหน้าเทียบยอดเงินสะสมจริงกับเป้าหมายที่ตั้งไว้
- **คุณครูติดตามผล:** แอดมิน/คุณครูสามารถตรวจสอบเป้าหมายของนักเรียนแต่ละคนเพื่อช่วยให้คำปรึกษาเชิงแนะแนวได้

### 4. ระบบแนะนำการเงินส่วนบุคคลอัจฉริยะ (Smart Financial Insights & Assistant) 🤖
- **เครื่องวิเคราะห์พฤติกรรมการเงิน (Insights Engine):** ทำการประมวลผลประวัติธุรกรรมและเป้าหมายของนักเรียนแบบเรียลไทม์เพื่อแสดงผลบนแดชบอร์ด:
  1. *พยากรณ์เป้าหมาย (Goal Projection):* วิเคราะห์ว่าเป้าหมายที่ตั้งไว้จะบรรลุผลทันกำหนดเวลาหรือไม่ พร้อมคำนวณจำนวนเงินฝากเพิ่มเติมเฉลี่ยต่อวันที่ต้องทำเพิ่มขึ้น
  2. *วินัยการออมต่อเนื่อง (Savings Streak):* ยกย่องและเชิดชูเกียรติการฝากเงินติดต่อกันรายสัปดาห์เพื่อสร้างขวัญกำลังใจในการออมเงิน
  3. *ประเมินพฤติกรรมการถอน (Withdrawal Alert):* แจ้งเตือนกรณีมียอดเงินถอนสะสมในรอบ 30 วัน มากกว่า 50% ของยอดฝาก หรือเตือนความสมดุลฝาก-ถอน
  4. *คำนวณดอกเบี้ยทบต้น (Compound Interest Forecast):* แสดงการเติบโตจำลองของเงินออมในอีก 3 ปีข้างหน้า ด้วยระบบปันผลสะสม เพื่อจูงใจให้เห็นถึงการทำงานของเงิน

### 5. บอร์ดจัดอันดับ (Leaderboard) 🏆
- แสดงการจัดอันดับนักเรียนออมเงินสูงสุด (Top Savers) ภายในโรงเรียน เพื่อสร้างความสนุกสนานและแรงจูงใจเชิงบวกในการออม

### 6. เครื่องคำนวณดอกเบี้ย (Interest Calculator) 🧮
- เครื่องคำนวณปันผลออมทรัพย์และดอกเบี้ยทบต้นล่วงหน้าตามระยะเวลาและอัตราดอกเบี้ยที่กำหนด พร้อมตารางแสดงเงินออมเติบโตรายปีและแผนภูมิภาพ

### 7. บันทึกกิจกรรมระบบและความปลอดภัย (Security & Log Management) 🛡️
- **บันทึกกิจกรรม (Activity Log):** บันทึกประวัติการกระทำของนักเรียนและครูทุกรายการ เช่น การเข้าสู่ระบบ, การสแกนคิวอาร์โค้ด, การทำธุรกรรม และไอพีแอดเดรส (IP Address)
- **ระบบการแจ้งเตือน (Notifications):** ระบบแจ้งเตือนรายการฝาก ถอน และข้อมูลความปลอดภัย

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Backend (.NET 8 Web API)
- **Framework:** .NET 8.0 SDK
- **ORM:** Entity Framework Core
- **Database:** PostgreSQL (Npgsql Client Library)
- **Authentication:** JWT Bearer Token (Json Web Token)
- **Documentation:** Swagger/OpenAPI UI

### Frontend (React)
- **Framework:** React 18 (Vite Bundler)
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios Interceptors
- **Styling:** Bootstrap 5, Custom Vanilla CSS (Premium gradients & glassmorphism shadows)
- **Charts:** Chart.js + react-chartjs-2
- **Alerts:** SweetAlert2 (Popups)
- **Icons:** Lucide React Icons
- **Utility:** QRCode.react

---

## 📦 การติดตั้งและรันโปรเจกต์ (Installation & Setup)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- .NET 8.0 SDK
- Node.js 18+ หรือ 20+
- PostgreSQL 14+ หรือใช้ Docker Desktop

### 1. ตั้งค่าฐานข้อมูล PostgreSQL

#### วิธีที่ 1: ติดตั้งผ่าน Docker
```bash
docker run --name student-savings-db \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_DB=Savings \
  -p 5432:5432 \
  -d postgres:latest
```

#### วิธีที่ 2: ติดตั้งบนระบบปฏิบัติการโดยตรง
- ดาวน์โหลดและติดตั้ง PostgreSQL จาก [postgresql.org](https://www.postgresql.org/download/)
- สร้าง Database เปล่าชื่อ `Savings` ในระบบ pgAdmin หรือ psql

### 2. ตั้งค่าและรัน Backend

```bash
cd Backend

# ติดตั้ง dependencies และกู้คืน NuGet packages
dotnet restore

# ตรวจสอบ Connection String ใน Backend/appsettings.json
# รูปแบบ: "Host=localhost;Database=Savings;Username=postgres;Password=1234"

# ทำการอัปเดต Database Schema ด้วย Migrations
dotnet ef database update

# สตาร์ทเซิร์ฟเวอร์ Backend (พอร์ต 5000)
dotnet run
```
Backend จะพร้อมให้บริการที่: `http://localhost:5000`  
แผงทดสอบ Swagger API: `http://localhost:5000/swagger`

### 3. ตั้งค่าและรัน Frontend

```bash
cd Frontend

# ติดตั้งแพ็กเกจ npm
npm install

# รันโหมดพัฒนา (Vite Server พอร์ต 5173)
npm run dev
```
Frontend จะแสดงผลในเว็บเบราว์เซอร์ที่: `http://localhost:5173`

### 4. การสร้างบัญชีแอดมินคนแรก
ระบบจะทำการ Seed ข้อมูลเริ่มต้นในฐานข้อมูลโดยอัตโนมัติเมื่อทำการรัน Backend ครั้งแรก โดยบัญชีแอดมินและข้อมูลนักเรียนตัวอย่างชุดแรกจะมีดังนี้:
- **ผู้ดูแลระบบ (Admin):**
  - Username: `admin`
  - Password: `admin123`
- **นักเรียนตัวอย่าง (Student Demo):**
  - Username: `student1` ถึง `student5` (เช่น `student1`)
  - Password: `student123`

---

## 📁 โครงสร้างโปรเจกต์แบบละเอียด (Detailed Project File Tree)

```
StudentSavingsSystem/
├── Backend/
│   ├── Controllers/
│   │   ├── ActivityController.cs             # ควบคุมประวัติกิจกรรม
│   │   ├── AuthController.cs                 # ควบคุมสิทธิ์และการลงทะเบียน
│   │   ├── FinancialAdvisorController.cs     # ควบคุมคำแนะนำทางการเงินส่วนบุคคล
│   │   ├── LeaderboardController.cs          # ควบคุมอันดับนักออมเงิน
│   │   ├── NotificationController.cs         # ควบคุมประวัติแจ้งเตือน
│   │   ├── ReportsController.cs              # ควบคุมรายงานธุรกรรม
│   │   ├── SavingGoalController.cs           # ควบคุมเป้าหมายการออมเงิน
│   │   ├── SavingsBucketController.cs        # ควบคุมกระปุกเงินออมย่อย
│   │   ├── SearchController.cs               # ควบคุมระบบค้นหาข้ามข้อมูล
│   │   ├── SettingsController.cs             # ควบคุมการตั้งค่าส่วนกลาง
│   │   └── TransactionController.cs          # ควบคุมธุรกรรมและข้อมูลนักเรียน
│   ├── Data/
│   │   ├── DbInitializer.cs                  # ตัวเตรียมและสร้างข้อมูลเริ่มต้น
│   │   └── SeedDataExpansion.cs              # ตัวกระจายข้อมูลจำลองนักเรียนและกระปุกย่อย
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
│   │   ├── HttpContextExtensions.cs          # คลาสเสริมในการดึง IP ผู้ใช้
│   │   └── UserMapper.cs                     # คลาสแมปปิ้งข้อมูลผู้ใช้เป็น DTO
│   ├── Migrations/                           # ไฟล์ประวัติโครงสร้าง DB (Entity Framework)
│   ├── Models/
│   │   ├── Entities/
│   │   │   ├── ActivityLog.cs                # โมเดลบันทึกประวัติการกระทำ
│   │   │   ├── Notification.cs               # โมเดลการแจ้งเตือน
│   │   │   ├── SavingGoal.cs                 # โมเดลเป้าหมายการออมเงิน
│   │   │   ├── SavingsBucket.cs              # โมเดลกระปุกเงินย่อย
│   │   │   ├── SystemSetting.cs              # โมเดลเก็บค่าตั้งค่าระบบ
│   │   │   ├── Transaction.cs                # โมเดลธุรกรรมการเงิน
│   │   │   └── User.cs                       # โมเดลข้อมูลบัญชีผู้ใช้
│   │   └── ApplicationDbContext.cs           # คอนเท็กซ์เชื่อมโยงฐานข้อมูล
│   ├── Services/
│   │   ├── ActivityLogService.cs             # บริการบันทึกกิจกรรม
│   │   ├── AuthService.cs                    # บริการยืนยันตัวตนและสร้างโทเค็น
│   │   ├── FinancialInsightsService.cs       # บริการวิเคราะห์พฤติกรรมการเงิน (Insights)
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
│   │   ├── LeaderboardService.cs             # บริการจัดอันดับนักออม
│   │   ├── NotificationService.cs            # บริการจัดการแจ้งเตือน
│   │   ├── SavingGoalService.cs              # บริการจัดการเป้าหมาย
│   │   ├── SavingsBucketService.cs           # บริการจัดการกระปุกเงินย่อย
│   │   ├── SearchService.cs                  # บริการสืบค้นข้อมูล
│   │   ├── SettingsService.cs                # บริการค่าตั้งค่าระบบ
│   │   └── TransactionService.cs             # บริการจัดการบัญชีฝากถอน
│   ├── Program.cs                            # ไฟล์หลักในการบูทสแตรปแอป Backend
│   ├── StudentSavingsSystem.csproj
│   └── appsettings.json
└── Frontend/
    ├── src/
    │   ├── config/
    │   │   └── apiClient.js                  # ไฟล์จัดการยิง API ด้วย Axios
    │   ├── contexts/
    │   │   └── AuthContext.jsx               # ตัวบันทึกสถานะการล็อกอินและบทบาทผู้ใช้
    │   ├── components/
    │   │   ├── FinancialInsights/
    │   │   │   └── FinancialInsights.jsx     # กล่องสไลด์คำแนะนำ
    │   │   ├── Modal/
    │   │   │   └── TransactionModal.jsx      # หน้าต่างป็อปอัปทำธุรกรรมฝากถอน
    │   │   ├── Notifications/
    │   │   │   └── NotificationSystem.jsx    # กล่องกระดิ่งแจ้งเตือนธุรกรรม
    │   │   └── Search/
    │   │       └── GlobalSearch.jsx          # แถบค้นหาข้อมูลครอสโอเวอร์
    │   ├── layouts/
    │   │   ├── MainLayout.jsx                # เค้าร่างหน้าต่างหลัก (Sidebar + Header + Footer)
    │   │   └── AuthLayout.jsx                # เค้าร่างหน้าต่างล็อกอิน
    │   ├── pages/
    │   │   ├── Home/
    │   │   │   └── Dashboard.jsx             # หน้าแดชบอร์ดสรุปผลหลัก
    │   │   ├── Students/
    │   │   │   └── Students.jsx              # หน้าจัดการรายชื่อและบัญชีเด็ก
    │   │   ├── Transactions/
    │   │   │   └── Transactions.jsx          # หน้าจอบันทึกฝาก-ถอนเงิน
    │   │   ├── SavingGoals/
    │   │   │   └── SavingGoals.jsx           # หน้าบันทึกเป้าหมายการออมเงิน
    │   │   ├── SavingsBuckets/
    │   │   │   └── SavingsBuckets.jsx        # หน้าจัดการกระปุกเงินย่อย (Envelope System)
    │   │   ├── Leaderboard/
    │   │   │   └── Leaderboard.jsx           # หน้าบอร์ดนักออมเงินดีเด่น
    │   │   ├── InterestCalculator/
    │   │   │   └── InterestCalculator.jsx    # หน้าเครื่องจำลองอัตราดอกเบี้ย
    │   │   ├── ActivityLog/
    │   │   │   └── ActivityLog.jsx           # หน้าประวัติการเข้าใช้และไอพี
    │   │   ├── Settings/
    │   │   │   └── Settings.jsx              # หน้าจอตั้งค่าระบบของคุณครู
    │   │   ├── Login/
    │   │   │   └── Login.jsx                 # หน้าจอเข้าสู่ระบบเข้าใช้งาน
    │   │   ├── MyQR/
    │   │   │   └── MyQR.jsx                  # หน้าจอดู QR Code ประจำตัวเด็ก
    │   │   └── Help/
    │   │       └── Help.jsx                  # หน้าศูนย์เรียนรู้ช่วยเหลือ
    │   ├── App.jsx                           # ไฟล์จัดการเส้นทางและเราเตอร์ React
    │   ├── index.css                         # ธีมสีหลักและคลาส CSS (Premium gradient)
    │   └── main.jsx                          # ไฟล์หลักในการเรนเดอร์ React DOM
    ├── package.json
    ├── vite.config.js
    └── index.html
```

---

## 🔐 ข้อมูลการเข้าใช้งานเบื้องต้น (Credentials)

- **ครู (Admin):**
  - Username: `admin` | Password: `admin123`
- **นักเรียน (Student):**
  - Username: `student1` ถึง `student5` | Password: `student123`
  - (สามารถสร้างบัญชีนักเรียนรายใหม่เพิ่มได้ที่เมนู "จัดการนักเรียน" ในบัญชีแอดมิน)

---

## 📝 API Endpoints สำคัญ (Major Endpoints)

### 1. ระบบยืนยันตัวตน (Authentication)
- `POST /api/auth/login` - เข้าสู่ระบบรับ JWT Token
- `GET /api/auth/me` - เรียกข้อมูลผู้ใช้งานปัจจุบัน

### 2. ระบบธุรกรรมและดูแลนักเรียน (Transactions & Students)
- `POST /api/transaction/create` - ฝากหรือถอนเงินให้นักเรียน (แอดมิน)
- `GET /api/transaction/recent` - รายการทำธุรกรรมล่าสุดในโรงเรียน
- `GET /api/transaction/student/{id}` - ดูรายการเงินทั้งหมดของนักเรียน
- `GET /api/transaction/dashboard` - ดึงสถิติยอดออมและจำนวนนักเรียน
- `POST /api/transaction/student/create` - เพิ่มข้อมูลนักเรียนใหม่เข้าระบบ
- `GET /api/transaction/students` - ดึงรายชื่อนักเรียนทั้งหมด
- `GET /api/transaction/student/by-qr/{qrCode}` - ค้นหานักเรียนผ่านการอ่านข้อมูล QR Code

### 3. ระบบกระปุกออมเงินย่อย (Savings Buckets)
- `GET /api/savingsbucket/summary` - สรุปยอดเงินกระปุกหลักและกระปุกย่อย (นักเรียน)
- `GET /api/savingsbucket/summary/{studentId}` - ดึงสรุปการจัดงบของนักเรียน (แอดมิน)
- `POST /api/savingsbucket` - สร้างกระปุกย่อยใหม่
- `PUT /api/savingsbucket/{bucketId}` - อัปเดตข้อมูลกระปุก
- `DELETE /api/savingsbucket/{bucketId}` - ลบกระปุก (เงินจะถูกโอนคืนบัญชีหลัก)
- `POST /api/savingsbucket/{bucketId}/transfer` - โอนย้ายเงิน (Allocate/Deallocate)
- `POST /api/savingsbucket/auto-allocate` - คำนวณแยกกระปุกอัตโนมัติสัดส่วน 50/30/20

### 4. ระบบวิเคราะห์และคำแนะนำทางการเงิน (Financial Insights)
- `GET /api/financialadvisor/insights` - รับคำแนะนำส่วนตัว (นักเรียน)
- `GET /api/financialadvisor/insights/{studentId}` - ดูข้อมูลวิเคราะห์นักเรียน (ครู)

### 5. เป้าหมายการออมเงิน (Saving Goals)
- `GET /api/savinggoal/student/{studentId}` - รายการเป้าหมายสะสมของนักเรียน
- `POST /api/savinggoal` - บันทึกเป้าหมายการออมชุดใหม่
- `PUT /api/savinggoal/{id}` - ปรับปรุงแก้ไขเป้าหมาย
- `DELETE /api/savinggoal/{id}` - ลบเป้าหมาย

### 6. จัดอันดับยอดเงินสะสม (Leaderboard)
- `GET /api/leaderboard` - อันดับนักเรียนที่มียอดเงินสะสมสูงสุด

---

## 🎨 การปรับแต่งระบบ (Customization)

### การตั้งค่าและป้ายประกาศ (Admin Settings)
คุณครูสามารถปรับแต่งอัตราปันผลสะสม หรือแก้ไขป้ายคำประกาศของระบบได้โดยตรงที่เมนู **"ตั้งค่า"** ในบัญชีผู้ดูแลระบบ ข้อมูลจะถูกบันทึกลงสู่โมเดล `SystemSettings` ทันที

### อัตราดอกเบี้ยและป้ายประกาศทั่วไป
แก้ไขได้ใน: `Backend/appsettings.json` หรือผ่านหน้าจอ UI จัดตั้งของระบบ

---

## 📄 ลิขสิทธิ์ (License)

Copyright © 2026 ระบบออมทรัพย์นักเรียน 

## 👨‍💻 ผู้พัฒนา (Developers)

Developed with ❤️ by 
