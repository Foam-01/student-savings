using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;
using System.Security.Cryptography;
using System.Text;

namespace StudentSavingsSystem.Data
{
    public static class SeedDataExpansion
    {
        private static readonly string[] Classrooms =
        {
            "ม.1/1", "ม.1/2", "ม.2/1", "ม.2/2", "ม.3/1",
            "ม.3/2", "ม.4/1", "ม.4/2", "ม.5/1", "ม.5/2", "ม.6/1"
        };

        private static readonly string[] FirstNames =
        {
            "สมชาย", "สมหญิง", "ปิติ", "มาลี", "วิชัย", "นภา", "กานต์", "พิมพ์", "ธนา", "อารยา",
            "ชัย", "วรา", "ณัฐ", "ศิริ", "เกียรติ", "ปวีณ์", "จิรา", "อนุชา", "พงศ์", "มนัส"
        };

        private static readonly string[] LastNames =
        {
            "ใจดี", "รักเรียน", "มานะ", "สดใส", "ขยัน", "แสงทอง", "มีสุข", "ศรีสุข", "ทองดี", "แก้วมณี"
        };

        public static async Task EnsureSchemaExtrasAsync(ApplicationDbContext context)
        {
            await context.Database.ExecuteSqlRawAsync("""
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "Classroom" character varying(20);
                CREATE TABLE IF NOT EXISTS "SystemSettings" (
                    "Key" character varying(50) PRIMARY KEY,
                    "Value" text NOT NULL,
                    "UpdatedAt" timestamp with time zone NOT NULL
                );
                CREATE TABLE IF NOT EXISTS "SavingsBuckets" (
                    "Id" SERIAL PRIMARY KEY,
                    "StudentId" integer NOT NULL,
                    "Name" character varying(100) NOT NULL,
                    "Description" character varying(500),
                    "Icon" character varying(50) NOT NULL DEFAULT 'archive',
                    "AllocatedAmount" numeric(18,2) NOT NULL DEFAULT 0,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone,
                    CONSTRAINT "FK_SavingsBuckets_Users_StudentId" FOREIGN KEY ("StudentId") REFERENCES "Users" ("Id") ON DELETE CASCADE
                );
                """);
        }

        public static async Task SeedDefaultBucketsAsync(ApplicationDbContext context)
        {
            var students = await context.Users.Where(u => u.Role == "Student").ToListAsync();
            var hasAnyBuckets = await context.SavingsBuckets.AnyAsync();
            if (!hasAnyBuckets && students.Any())
            {
                foreach (var s in students)
                {
                    context.SavingsBuckets.AddRange(
                        new SavingsBucket
                        {
                            StudentId = s.Id,
                            Name = "เพื่อการเรียน 📚",
                            Description = "กระปุกสำหรับสะสมซื้ออุปกรณ์การเรียน ค่าหนังสือ หรือค่าเล่าเรียน (สัดส่วน 50%)",
                            Icon = "book",
                            AllocatedAmount = Math.Round(s.Balance * 0.40m, 2),
                            CreatedAt = DateTime.UtcNow
                        },
                        new SavingsBucket
                        {
                            StudentId = s.Id,
                            Name = "ตามล่าความฝัน 🎮",
                            Description = "กระปุกสะสมสำหรับซื้อของเล่น บอร์ดเกม ของขวัญ หรือสิ่งที่อยากได้ (สัดส่วน 30%)",
                            Icon = "gamepad",
                            AllocatedAmount = Math.Round(s.Balance * 0.25m, 2),
                            CreatedAt = DateTime.UtcNow
                        },
                        new SavingsBucket
                        {
                            StudentId = s.Id,
                            Name = "เงินใช้ยามจำเป็น 🩺",
                            Description = "กระปุกสำรองฉุกเฉิน ยามเจ็บป่วย หรือของใช้จำเป็นด่วน (สัดส่วน 20%)",
                            Icon = "heart",
                            AllocatedAmount = Math.Round(s.Balance * 0.15m, 2),
                            CreatedAt = DateTime.UtcNow
                        }
                    );
                }
                await context.SaveChangesAsync();
                Console.WriteLine("Seed: Default Savings Buckets created with proportional demo allocations for all students.");
            }
        }

        public static async Task UpdateExistingBucketsWithDemoDataAsync(ApplicationDbContext context)
        {
            var students = await context.Users.Where(u => u.Role == "Student").ToListAsync();
            var buckets = await context.SavingsBuckets.ToListAsync();

            bool anyUpdated = false;
            foreach (var student in students)
            {
                var studentBuckets = buckets.Where(b => b.StudentId == student.Id).ToList();
                if (studentBuckets.Any() && studentBuckets.Sum(b => b.AllocatedAmount) == 0m && student.Balance > 0)
                {
                    foreach (var b in studentBuckets)
                    {
                        if (b.Name.Contains("การศึกษา") || b.Name.Contains("การเรียน"))
                        {
                            b.AllocatedAmount = Math.Round(student.Balance * 0.40m, 2);
                        }
                        else if (b.Name.Contains("ความฝัน") || b.Name.Contains("ล่าความฝัน"))
                        {
                            b.AllocatedAmount = Math.Round(student.Balance * 0.25m, 2);
                        }
                        else if (b.Name.Contains("ยามจำเป็น") || b.Name.Contains("ฉุกเฉิน"))
                        {
                            b.AllocatedAmount = Math.Round(student.Balance * 0.15m, 2);
                        }
                        b.UpdatedAt = DateTime.UtcNow;
                    }
                    anyUpdated = true;
                }
            }

            if (anyUpdated)
            {
                await context.SaveChangesAsync();
                Console.WriteLine("Demo Data: Savings Buckets populated with proportional balance for all students with empty allocations.");
            }
        }

        public static async Task ExpandIfNeededAsync(ApplicationDbContext context)
        {
            var studentCount = await context.Users.CountAsync(u => u.Role == "Student");
            if (studentCount >= 100) return;

            Console.WriteLine("Expanding database with more students and transactions...");

            var random = new Random(42);
            var existingUsernames = await context.Users.Select(u => u.Username).ToListAsync();
            var students = new List<User>();
            var target = 100 - studentCount;
            var index = studentCount + 1;

            while (students.Count < target)
            {
                var username = $"student{index}";
                index++;
                if (existingUsernames.Contains(username)) continue;

                var classroom = Classrooms[random.Next(Classrooms.Length)];
                var prefix = random.Next(2) == 0 ? "นาย" : "นางสาว";
                var fullName = $"{prefix}{FirstNames[random.Next(FirstNames.Length)]} {LastNames[random.Next(LastNames.Length)]}";

                var user = new User
                {
                    Username = username,
                    PasswordHash = HashPassword("student123"),
                    FullName = fullName,
                    Role = "Student",
                    Classroom = classroom,
                    Balance = 0,
                    QrCodeData = $"STU-{username.ToUpper()}-{random.Next(1000, 9999)}",
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(30, 200))
                };
                context.Users.Add(user);
                students.Add(user);
                existingUsernames.Add(username);
            }

            await context.SaveChangesAsync();

            var allStudents = await context.Users.Where(u => u.Role == "Student").ToListAsync();
            var now = DateTime.UtcNow;
            var descriptions = new[] { "ออมรายสัปดาห์", "ออมจากค่าขนม", "ทุนการศึกษา", "รายได้พิเศษ", "ค่าทำงาน part-time" };

            for (var i = 0; i < 500; i++)
            {
                var student = allStudents[random.Next(allStudents.Count)];
                var isDeposit = random.Next(100) < 72;
                var amount = (decimal)(random.Next(20, 1500) / 10.0) * 10;

                if (!isDeposit && student.Balance < amount) continue;

                context.Transactions.Add(new Transaction
                {
                    StudentId = student.Id,
                    TransactionType = isDeposit ? "Deposit" : "Withdraw",
                    Amount = amount,
                    TransactionDate = now.AddDays(-random.Next(0, 120)),
                    ManagedBy = "admin",
                    Description = descriptions[random.Next(descriptions.Length)]
                });
            }

            await context.SaveChangesAsync();

            foreach (var student in allStudents)
            {
                var deposits = await context.Transactions
                    .Where(t => t.StudentId == student.Id && t.TransactionType == "Deposit")
                    .SumAsync(t => t.Amount);
                var withdrawals = await context.Transactions
                    .Where(t => t.StudentId == student.Id && t.TransactionType == "Withdraw")
                    .SumAsync(t => t.Amount);
                student.Balance = deposits - withdrawals;
            }

            await context.SaveChangesAsync();
            Console.WriteLine($"Expansion done. Total students: {allStudents.Count}");
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            return Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
        }
    }
}
