using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;
using StudentSavingsSystem.DTOs.SavingsBucket;

namespace StudentSavingsSystem.Services
{
    public class SavingsBucketService : ISavingsBucketService
    {
        private readonly ApplicationDbContext _context;
        private readonly IActivityLogService _activityLog;

        public SavingsBucketService(ApplicationDbContext context, IActivityLogService activityLog)
        {
            _context = context;
            _activityLog = activityLog;
        }

        public async Task<SavingsBucketSummaryDto?> GetStudentBucketsSummaryAsync(int studentId)
        {
            var student = await _context.Users.FindAsync(studentId);
            if (student == null || student.Role != "Student") return null;

            var buckets = await _context.SavingsBuckets
                .Where(b => b.StudentId == studentId)
                .OrderBy(b => b.CreatedAt)
                .ToListAsync();

            var allocatedBalance = buckets.Sum(b => b.AllocatedAmount);
            var unallocatedBalance = student.Balance - allocatedBalance;

            return new SavingsBucketSummaryDto
            {
                TotalBalance = student.Balance,
                AllocatedBalance = allocatedBalance,
                UnallocatedBalance = unallocatedBalance,
                Buckets = buckets.Select(b => MapToDto(b, student)).ToList()
            };
        }

        public async Task<SavingsBucketResponseDto?> CreateBucketAsync(int studentId, SavingsBucketRequestDto request)
        {
            var student = await _context.Users.FindAsync(studentId);
            if (student == null || student.Role != "Student") return null;

            var bucket = new SavingsBucket
            {
                StudentId = studentId,
                Name = request.Name,
                Description = request.Description,
                Icon = request.Icon,
                AllocatedAmount = 0m,
                CreatedAt = DateTime.UtcNow
            };

            _context.SavingsBuckets.Add(bucket);
            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "savings_bucket",
                student.Username,
                "สร้างกระปุกออมเงิน",
                $"นักเรียน {student.FullName} ได้สร้างกระปุกออมเงินใหม่: {request.Name}"
            );

            return MapToDto(bucket, student);
        }

        public async Task<SavingsBucketResponseDto?> UpdateBucketAsync(int studentId, int bucketId, SavingsBucketRequestDto request)
        {
            var bucket = await _context.SavingsBuckets
                .Include(b => b.Student)
                .FirstOrDefaultAsync(b => b.Id == bucketId && b.StudentId == studentId);

            if (bucket == null) return null;

            bucket.Name = request.Name;
            bucket.Description = request.Description;
            bucket.Icon = request.Icon;
            bucket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(bucket, bucket.Student);
        }

        public async Task<bool> DeleteBucketAsync(int studentId, int bucketId)
        {
            var bucket = await _context.SavingsBuckets
                .Include(b => b.Student)
                .FirstOrDefaultAsync(b => b.Id == bucketId && b.StudentId == studentId);

            if (bucket == null) return false;

            _context.SavingsBuckets.Remove(bucket);
            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "savings_bucket",
                bucket.Student.Username,
                "ลบกระปุกออมเงิน",
                $"ลบกระปุกออมเงิน: {bucket.Name} (ยอดเงินที่ถูกคืนสู่กระปุกหลัก: {bucket.AllocatedAmount:N2} บาท)"
            );

            return true;
        }

        public async Task<SavingsBucketSummaryDto?> TransferFundsAsync(int studentId, int bucketId, SavingsBucketTransferDto transfer)
        {
            var student = await _context.Users.FindAsync(studentId);
            if (student == null || student.Role != "Student") return null;

            var bucket = await _context.SavingsBuckets
                .FirstOrDefaultAsync(b => b.Id == bucketId && b.StudentId == studentId);

            if (bucket == null) return null;

            var allBuckets = await _context.SavingsBuckets
                .Where(b => b.StudentId == studentId)
                .ToListAsync();

            var allocatedBalance = allBuckets.Sum(b => b.AllocatedAmount);
            var unallocatedBalance = student.Balance - allocatedBalance;

            if (transfer.Direction.ToLower() == "allocate")
            {
                if (transfer.Amount <= 0) return null;
                if (transfer.Amount > unallocatedBalance)
                {
                    throw new InvalidOperationException("ยอดเงินที่ยังไม่ได้จัดสรรไม่เพียงพอสำหรับการโอนเข้ากระปุกย่อย");
                }

                bucket.AllocatedAmount += transfer.Amount;
                bucket.UpdatedAt = DateTime.UtcNow;
            }
            else if (transfer.Direction.ToLower() == "deallocate")
            {
                if (transfer.Amount <= 0) return null;
                if (transfer.Amount > bucket.AllocatedAmount)
                {
                    throw new InvalidOperationException("ยอดเงินในกระปุกย่อยไม่เพียงพอสำหรับการโอนออก");
                }

                bucket.AllocatedAmount -= transfer.Amount;
                bucket.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                return null;
            }

            await _context.SaveChangesAsync();

            var actionName = transfer.Direction == "allocate" ? "โอนเงินเข้ากระปุกย่อย" : "โอนเงินออกสู่กระปุกหลัก";
            await _activityLog.LogAsync(
                "savings_bucket",
                student.Username,
                actionName,
                $"นักเรียน {student.FullName} ได้ทำการ {actionName} กระปุก '{bucket.Name}' จำนวนเงิน {transfer.Amount:N2} บาท"
            );

            return await GetStudentBucketsSummaryAsync(studentId);
        }

        public async Task<SavingsBucketSummaryDto?> AutoAllocateAsync(int studentId)
        {
            var student = await _context.Users.FindAsync(studentId);
            if (student == null || student.Role != "Student") return null;

            // Ensure the three default buckets exist
            var buckets = await _context.SavingsBuckets
                .Where(b => b.StudentId == studentId)
                .ToListAsync();

            var eduBucket = buckets.FirstOrDefault(b => b.Name.Contains("การศึกษา") || b.Name.Contains("การเรียน"));
            var dreamBucket = buckets.FirstOrDefault(b => b.Name.Contains("ความฝัน") || b.Name.Contains("ล่าความฝัน"));
            var emergencyBucket = buckets.FirstOrDefault(b => b.Name.Contains("ยามจำเป็น") || b.Name.Contains("ฉุกเฉิน"));

            var now = DateTime.UtcNow;

            if (eduBucket == null)
            {
                eduBucket = new SavingsBucket
                {
                    StudentId = studentId,
                    Name = "เพื่อการเรียน 📚",
                    Description = "กระปุกสำหรับสะสมซื้ออุปกรณ์การเรียน ค่าหนังสือ หรือค่าเล่าเรียน (สัดส่วน 50%)",
                    Icon = "book",
                    AllocatedAmount = 0m,
                    CreatedAt = now
                };
                _context.SavingsBuckets.Add(eduBucket);
                buckets.Add(eduBucket);
            }

            if (dreamBucket == null)
            {
                dreamBucket = new SavingsBucket
                {
                    StudentId = studentId,
                    Name = "ตามล่าความฝัน 🎮",
                    Description = "กระปุกสะสมสำหรับซื้อของเล่น บอร์ดเกม ของขวัญ หรือสิ่งที่อยากได้ (สัดส่วน 30%)",
                    Icon = "gamepad",
                    AllocatedAmount = 0m,
                    CreatedAt = now
                };
                _context.SavingsBuckets.Add(dreamBucket);
                buckets.Add(dreamBucket);
            }

            if (emergencyBucket == null)
            {
                emergencyBucket = new SavingsBucket
                {
                    StudentId = studentId,
                    Name = "เงินใช้ยามจำเป็น 🩺",
                    Description = "กระปุกสำรองฉุกเฉิน ยามเจ็บป่วย หรือของใช้จำเป็นด่วน (สัดส่วน 20%)",
                    Icon = "heart",
                    AllocatedAmount = 0m,
                    CreatedAt = now
                };
                _context.SavingsBuckets.Add(emergencyBucket);
                buckets.Add(emergencyBucket);
            }

            // Save changes to generate IDs if they were just added
            await _context.SaveChangesAsync();

            // Calculate proportions of Total Balance
            decimal totalBalance = student.Balance;
            decimal eduTarget = Math.Round(totalBalance * 0.50m, 2);
            decimal dreamTarget = Math.Round(totalBalance * 0.30m, 2);
            // Emergency gets the remainder to avoid rounding issues and ensure total allocated equals totalBalance
            decimal emergencyTarget = totalBalance - eduTarget - dreamTarget;

            if (emergencyTarget < 0) emergencyTarget = 0; // Safeguard

            // Set the allocated amounts
            eduBucket.AllocatedAmount = eduTarget;
            dreamBucket.AllocatedAmount = dreamTarget;
            emergencyBucket.AllocatedAmount = emergencyTarget;

            eduBucket.UpdatedAt = now;
            dreamBucket.UpdatedAt = now;
            emergencyBucket.UpdatedAt = now;

            // Set all other custom buckets to 0 (if any exist) to ensure sum of allocated does not exceed student balance
            foreach (var b in buckets)
            {
                if (b.Id != eduBucket.Id && b.Id != dreamBucket.Id && b.Id != emergencyBucket.Id)
                {
                    b.AllocatedAmount = 0m;
                    b.UpdatedAt = now;
                }
            }

            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "savings_bucket",
                student.Username,
                "จัดงบประมาณอัตโนมัติ 50/30/20",
                $"จัดสรรเงินออมอัตโนมัติตามสัดส่วน 50/30/20 เรียบร้อยแล้ว (เพื่อการเรียน: {eduTarget:N2} บาท, เพื่อความฝัน: {dreamTarget:N2} บาท, ใช้ยามจำเป็น: {emergencyTarget:N2} บาท)"
            );

            return await GetStudentBucketsSummaryAsync(studentId);
        }

        private static SavingsBucketResponseDto MapToDto(SavingsBucket b, User student)
        {
            return new SavingsBucketResponseDto
            {
                Id = b.Id,
                StudentId = b.StudentId,
                StudentName = student.FullName,
                Name = b.Name,
                Description = b.Description,
                Icon = b.Icon,
                AllocatedAmount = b.AllocatedAmount,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            };
        }
    }
}
