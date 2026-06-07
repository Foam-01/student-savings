using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;
using StudentSavingsSystem.DTOs.Settings;
using StudentSavingsSystem.Services;
using System.Security.Cryptography;
using System.Text;

namespace StudentSavingsSystem.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

            await ApplyMigrationsAsync(context);
            await EnsureExtraTablesAsync(context);
            await SeedDataExpansion.EnsureSchemaExtrasAsync(context);

            if (!await context.Users.AnyAsync(u => u.Role == "Admin"))
            {
                await authService.CreateUserAsync("admin", "admin123", "ผู้ดูแลระบบหลัก", "Admin");
                Console.WriteLine("Seed: admin / admin123");
            }

            if (!await context.Users.AnyAsync(u => u.Role == "Student"))
            {
                await SeedStudentsAndTransactionsAsync(context);
            }

            if (!await context.SavingGoals.AnyAsync())
            {
                await SeedSavingGoalsAsync(context);
            }

            await SeedDataExpansion.SeedDefaultBucketsAsync(context);
            await SeedDataExpansion.UpdateExistingBucketsWithDemoDataAsync(context);

            if (!await context.ActivityLogs.AnyAsync())
            {
                await SeedActivitiesAndNotificationsAsync(context);
            }

            await SeedDataExpansion.ExpandIfNeededAsync(context);

            if (!await context.SystemSettings.AnyAsync())
            {
                var settingsService = scope.ServiceProvider.GetRequiredService<ISettingsService>();
                await settingsService.SaveSettingsAsync(new SystemSettingsDto());
            }

            Console.WriteLine("Database ready.");
        }

        private static async Task ApplyMigrationsAsync(ApplicationDbContext context)
        {
            var pending = await context.Database.GetPendingMigrationsAsync();
            var applied = await context.Database.GetAppliedMigrationsAsync();

            if (!applied.Contains("20260530120000_AddActivityAndNotifications") &&
                pending.Contains("20260530120000_AddActivityAndNotifications"))
            {
                await context.Database.MigrateAsync();
                return;
            }

            if (!applied.Any())
            {
                await context.Database.MigrateAsync();
            }
            else if (pending.Any())
            {
                try
                {
                    await context.Database.MigrateAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Migration skipped: {ex.Message}");
                }
            }
        }

        private static async Task EnsureExtraTablesAsync(ApplicationDbContext context)
        {
            await context.Database.ExecuteSqlRawAsync("""
                CREATE TABLE IF NOT EXISTS "ActivityLogs" (
                    "Id" SERIAL PRIMARY KEY,
                    "Type" character varying(30) NOT NULL,
                    "UserName" character varying(50) NOT NULL,
                    "Action" character varying(100) NOT NULL,
                    "Details" character varying(500),
                    "IpAddress" character varying(45),
                    "CreatedAt" timestamp with time zone NOT NULL
                );
                CREATE TABLE IF NOT EXISTS "Notifications" (
                    "Id" SERIAL PRIMARY KEY,
                    "UserId" integer,
                    "Type" character varying(30) NOT NULL,
                    "Title" character varying(100) NOT NULL,
                    "Message" character varying(500) NOT NULL,
                    "IsRead" boolean NOT NULL DEFAULT FALSE,
                    "CreatedAt" timestamp with time zone NOT NULL
                );
                CREATE TABLE IF NOT EXISTS "SavingGoals" (
                    "Id" SERIAL PRIMARY KEY,
                    "StudentId" integer NOT NULL,
                    "Title" character varying(100) NOT NULL,
                    "Description" character varying(500),
                    "TargetAmount" numeric(18,2) NOT NULL,
                    "TargetDate" timestamp with time zone,
                    "IsCompleted" boolean NOT NULL DEFAULT FALSE,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone,
                    CONSTRAINT "FK_SavingGoals_Users_StudentId" FOREIGN KEY ("StudentId") REFERENCES "Users" ("Id") ON DELETE CASCADE
                );
                """);

            await context.Database.ExecuteSqlRawAsync("""
                INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                SELECT '20260530120000_AddActivityAndNotifications', '8.0.0'
                WHERE NOT EXISTS (
                    SELECT 1 FROM "__EFMigrationsHistory"
                    WHERE "MigrationId" = '20260530120000_AddActivityAndNotifications'
                );
                """);
        }

        private static async Task SeedStudentsAndTransactionsAsync(ApplicationDbContext context)
        {
            Console.WriteLine("Seeding students and transactions...");

            var students = new List<(string Username, string FullName, string Qr, string Classroom, decimal Balance)>
            {
                ("student1", "นายสมชาย ใจดี", "STU-STUDENT1-A1B2C3D4", "ม.4/1", 5200m),
                ("student2", "นางสาวสมหญิง รักเรียน", "STU-STUDENT2-E5F6G7H8", "ม.4/1", 3150m),
                ("student3", "นายปิติ มานะ", "STU-STUDENT3-I9J0K1L2", "ม.5/2", 15800m),
                ("student4", "นางสาวมาลี สดใส", "STU-STUDENT4-M3N4O5P6", "ม.3/1", 890m),
                ("student5", "นายวิชัย ขยัน", "STU-STUDENT5-Q7R8S9T0", "ม.2/2", 2400m),
            };

            var studentEntities = new List<User>();
            foreach (var s in students)
            {
                var user = new User
                {
                    Username = s.Username,
                    PasswordHash = HashPassword("student123"),
                    FullName = s.FullName,
                    Role = "Student",
                    Balance = 0,
                    QrCodeData = s.Qr,
                    Classroom = s.Classroom,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3)
                };
                context.Users.Add(user);
                studentEntities.Add(user);
            }

            await context.SaveChangesAsync();

            var now = DateTime.UtcNow;
            var txSeed = new List<(int Index, string Type, decimal Amount, int DaysAgo, string? Desc)>
            {
                (0, "Deposit", 2000m, 85, "เปิดบัญชีออม"),
                (0, "Deposit", 1500m, 60, "ออมจากค่าขนม"),
                (0, "Deposit", 1200m, 30, "ออมรายเดือน"),
                (0, "Deposit", 500m, 5, "ฝากเพิ่ม"),
                (1, "Deposit", 3000m, 70, "ออมจากทุนการศึกษา"),
                (1, "Withdraw", 200m, 45, "ถอนซื้อของใช้การเรียน"),
                (1, "Deposit", 350m, 10, "ฝากสะสม"),
                (2, "Deposit", 10000m, 90, "ออมรายได้พิเศษ"),
                (2, "Deposit", 5000m, 40, "ออมจากกิจกรรม"),
                (2, "Withdraw", 500m, 15, "ถอนซื้อหนังสือ"),
                (2, "Deposit", 1300m, 3, "ฝากเพิ่ม"),
                (3, "Deposit", 500m, 50, "ออมเริ่มต้น"),
                (3, "Deposit", 400m, 20, "ออมเพิ่ม"),
                (3, "Withdraw", 10m, 7, "ถอนทอน"),
                (4, "Deposit", 1500m, 55, "ออมจากงาน"),
                (4, "Deposit", 900m, 25, "ออมรายสัปดาห์"),
            };

            foreach (var t in txSeed)
            {
                context.Transactions.Add(new Transaction
                {
                    StudentId = studentEntities[t.Index].Id,
                    TransactionType = t.Type,
                    Amount = t.Amount,
                    TransactionDate = now.AddDays(-t.DaysAgo),
                    ManagedBy = "admin",
                    Description = t.Desc
                });
            }

            await context.SaveChangesAsync();

            for (var i = 0; i < studentEntities.Count; i++)
            {
                studentEntities[i].Balance = students[i].Balance;
            }

            await context.SaveChangesAsync();
            Console.WriteLine("Students: student1..student5 / student123");
        }

        private static async Task SeedActivitiesAndNotificationsAsync(ApplicationDbContext context)
        {
            Console.WriteLine("Seeding activity logs and notifications...");

            var now = DateTime.UtcNow;
            context.ActivityLogs.AddRange(
                new ActivityLog { Type = "login", UserName = "admin", Action = "เข้าสู่ระบบ", Details = "Admin เข้าสู่ระบบ", IpAddress = "192.168.1.100", CreatedAt = now.AddHours(-1) },
                new ActivityLog { Type = "student", UserName = "admin", Action = "เพิ่มนักเรียน", Details = "เพิ่มข้อมูลนักเรียนตัวอย่าง 5 คน", IpAddress = "192.168.1.100", CreatedAt = now.AddHours(-2) },
                new ActivityLog { Type = "transaction", UserName = "student1", Action = "ฝากเงิน", Details = "นายสมชาย ใจดี ฝากเงิน 500 บาท", IpAddress = "192.168.1.101", CreatedAt = now.AddDays(-5) },
                new ActivityLog { Type = "transaction", UserName = "student2", Action = "ถอนเงิน", Details = "นางสาวสมหญิง รักเรียน ถอนเงิน 200 บาท", IpAddress = "192.168.1.102", CreatedAt = now.AddDays(-45) },
                new ActivityLog { Type = "transaction", UserName = "student3", Action = "ฝากเงิน", Details = "นายปิติ มานะ ฝากเงิน 1,300 บาท", IpAddress = "192.168.1.103", CreatedAt = now.AddDays(-3) },
                new ActivityLog { Type = "login", UserName = "student1", Action = "เข้าสู่ระบบ", Details = "Student เข้าสู่ระบบ", IpAddress = "192.168.1.101", CreatedAt = now.AddDays(-2) },
                new ActivityLog { Type = "system", UserName = "system", Action = "Backup", Details = "สำรองข้อมูลอัตโนมัติ", IpAddress = "127.0.0.1", CreatedAt = now.AddDays(-1) }
            );

            var admin = await context.Users.FirstOrDefaultAsync(u => u.Username == "admin");
            if (admin != null)
            {
                context.Notifications.AddRange(
                    new Notification { UserId = admin.Id, Type = "transaction", Title = "รายการใหม่", Message = "นายสมชาย ใจดี ฝากเงิน 500 บาท", IsRead = false, CreatedAt = now.AddHours(-1) },
                    new Notification { UserId = admin.Id, Type = "student", Title = "นักเรียนใหม่", Message = "มีนักเรียนตัวอย่าง 5 คนในระบบ", IsRead = false, CreatedAt = now.AddHours(-3) },
                    new Notification { UserId = admin.Id, Type = "system", Title = "พร้อมใช้งาน", Message = "โหลดข้อมูลตัวอย่างเข้าฐานข้อมูลแล้ว", IsRead = true, CreatedAt = now.AddHours(-4) },
                    new Notification { UserId = admin.Id, Type = "transaction", Title = "ถอนเงิน", Message = "นายปิติ มานะ ถอนเงิน 500 บาท", IsRead = true, CreatedAt = now.AddDays(-15) }
                );
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedSavingGoalsAsync(ApplicationDbContext context)
        {
            Console.WriteLine("Seeding saving goals...");
            var student1 = await context.Users.FirstOrDefaultAsync(u => u.Username == "student1");
            var student2 = await context.Users.FirstOrDefaultAsync(u => u.Username == "student2");
            var student3 = await context.Users.FirstOrDefaultAsync(u => u.Username == "student3");

            var now = DateTime.UtcNow;

            if (student1 != null)
            {
                context.SavingGoals.AddRange(
                    new SavingGoal { StudentId = student1.Id, Title = "ออมเงินซื้อจักรยานเสือภูเขา", Description = "เป้าหมายสำหรับเดินทางมาโรงเรียน", TargetAmount = 3500m, TargetDate = now.AddMonths(2), IsCompleted = false, CreatedAt = now.AddDays(-15) },
                    new SavingGoal { StudentId = student1.Id, Title = "ซื้อหนังสือเรียนฟิสิกส์", Description = "คู่มือเตรียมสอบมหาลัย", TargetAmount = 450m, TargetDate = now.AddDays(10), IsCompleted = false, CreatedAt = now.AddDays(-5) }
                );
            }

            if (student2 != null)
            {
                context.SavingGoals.AddRange(
                    new SavingGoal { StudentId = student2.Id, Title = "ซื้อแท็บเล็ตเพื่อการเรียน", Description = "ออมเพื่อซื้อ iPad มือสอง", TargetAmount = 8000m, TargetDate = now.AddMonths(4), IsCompleted = false, CreatedAt = now.AddDays(-30) }
                );
            }

            if (student3 != null)
            {
                context.SavingGoals.AddRange(
                    new SavingGoal { StudentId = student3.Id, Title = "ค่าสมัครสอบคณะวิศวกรรมศาสตร์", Description = "ค่าสอบ Gat/Pat และอื่นๆ", TargetAmount = 1500m, TargetDate = now.AddDays(30), IsCompleted = false, CreatedAt = now.AddDays(-10) }
                );
            }

            await context.SaveChangesAsync();
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
