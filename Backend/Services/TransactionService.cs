using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.DTOs.Dashboard;
using StudentSavingsSystem.DTOs.Reports;
using StudentSavingsSystem.DTOs.Transaction;
using StudentSavingsSystem.DTOs.User;
using StudentSavingsSystem.Helpers;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;

namespace StudentSavingsSystem.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService;
        private readonly IActivityLogService _activityLog;
        private readonly INotificationService _notifications;

        public TransactionService(
            ApplicationDbContext context,
            IAuthService authService,
            IActivityLogService activityLog,
            INotificationService notifications)
        {
            _context = context;
            _authService = authService;
            _activityLog = activityLog;
            _notifications = notifications;
        }

        public async Task<TransactionResponseDto?> CreateTransactionAsync(
            TransactionRequestDto request, string managedBy, string? ipAddress = null)
        {
            var student = await _context.Users.FindAsync(request.StudentId);
            if (student == null || student.Role != "Student")
                return null;

            if (request.TransactionType == "Withdraw")
            {
                var allocatedSum = await _context.SavingsBuckets
                    .Where(b => b.StudentId == request.StudentId)
                    .SumAsync(b => b.AllocatedAmount);

                var unallocatedBalance = student.Balance - allocatedSum;
                if (unallocatedBalance < request.Amount)
                    return null;
            }

            var transaction = new Transaction
            {
                StudentId = request.StudentId,
                TransactionType = request.TransactionType,
                Amount = request.Amount,
                TransactionDate = DateTime.UtcNow,
                ManagedBy = managedBy,
                Description = request.Description
            };

            if (request.TransactionType == "Deposit")
                student.Balance += request.Amount;
            else if (request.TransactionType == "Withdraw")
                student.Balance -= request.Amount;

            student.UpdatedAt = DateTime.UtcNow;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            var typeLabel = request.TransactionType == "Deposit" ? "ฝากเงิน" : "ถอนเงิน";
            var details = $"{student.FullName} {typeLabel} {request.Amount:N2} บาท";

            await _activityLog.LogAsync("transaction", student.Username, typeLabel, details, ipAddress);
            await _notifications.NotifyAdminsAsync(
                "transaction",
                "รายการใหม่",
                details);

            return MapTransaction(transaction, student.FullName);
        }

        public async Task<List<TransactionResponseDto>> GetRecentTransactionsAsync(int count = 10)
        {
            var transactions = await _context.Transactions
                .Include(t => t.Student)
                .OrderByDescending(t => t.TransactionDate)
                .Take(count)
                .ToListAsync();

            return transactions.Select(t => MapTransaction(t, t.Student.FullName)).ToList();
        }

        public async Task<List<TransactionResponseDto>> GetStudentTransactionsAsync(int studentId)
        {
            var transactions = await _context.Transactions
                .Include(t => t.Student)
                .Where(t => t.StudentId == studentId)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();

            return transactions.Select(t => MapTransaction(t, t.Student.FullName)).ToList();
        }

        public async Task<DashboardDto> GetDashboardStatisticsAsync()
        {
            return await BuildDashboardAsync();
        }

        public async Task<ReportsDetailDto> GetReportsDetailAsync(string range = "month")
        {
            var dashboard = await BuildDashboardAsync();
            var now = DateTime.UtcNow;
            var weekStart = now.AddDays(-7);
            var monthStart = now.AddDays(-30);

            var transactions = await _context.Transactions.ToListAsync();

            return new ReportsDetailDto
            {
                Summary = dashboard,
                MonthlyStatistics = dashboard.MonthlyStatistics,
                TopStudents = dashboard.TopStudents,
                ClassroomSummaries = dashboard.ClassroomSummaries,
                TransactionsThisWeek = transactions.Count(t => t.TransactionDate >= weekStart),
                TransactionsThisMonth = transactions.Count(t => t.TransactionDate >= monthStart),
                NetSavings = dashboard.TotalDeposits - dashboard.TotalWithdrawals
            };
        }

        private async Task<DashboardDto> BuildDashboardAsync()
        {
            var students = await _context.Users.Where(u => u.Role == "Student").ToListAsync();
            var transactions = await _context.Transactions.ToListAsync();
            var today = DateTime.UtcNow.Date;

            var monthlyStats = transactions
                .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new MonthlyStatisticsDto
                {
                    Month = GetThaiMonthLabel(g.Key.Year, g.Key.Month),
                    DepositAmount = g.Where(t => t.TransactionType == "Deposit").Sum(t => t.Amount),
                    WithdrawAmount = g.Where(t => t.TransactionType == "Withdraw").Sum(t => t.Amount)
                })
                .TakeLast(12)
                .ToList();

            var topStudents = students
                .OrderByDescending(s => s.Balance)
                .Take(10)
                .Select(s => new TopStudentDto
                {
                    Id = s.Id,
                    FullName = s.FullName,
                    Username = s.Username,
                    Classroom = s.Classroom,
                    Balance = s.Balance
                })
                .ToList();

            var classroomSummaries = students
                .GroupBy(s => s.Classroom ?? "ไม่ระบุ")
                .Select(g => new ClassroomSummaryDto
                {
                    Classroom = g.Key,
                    StudentCount = g.Count(),
                    TotalBalance = g.Sum(x => x.Balance)
                })
                .OrderBy(c => c.Classroom)
                .ToList();

            var todayTx = transactions.Where(t => t.TransactionDate.Date == today).ToList();

            return new DashboardDto
            {
                TotalBalance = students.Sum(s => s.Balance),
                TotalStudents = students.Count,
                TotalTransactions = transactions.Count,
                TotalDeposits = transactions.Where(t => t.TransactionType == "Deposit").Sum(t => t.Amount),
                TotalWithdrawals = transactions.Where(t => t.TransactionType == "Withdraw").Sum(t => t.Amount),
                TodayTransactions = todayTx.Count,
                TodayDeposits = todayTx.Where(t => t.TransactionType == "Deposit").Sum(t => t.Amount),
                AverageBalance = students.Count > 0 ? students.Average(s => s.Balance) : 0,
                MonthlyStatistics = monthlyStats,
                TopStudents = topStudents,
                ClassroomSummaries = classroomSummaries
            };
        }

        public async Task<UserResponseDto?> CreateStudentAsync(
            string username, string password, string fullName, string? classroom, string managedBy, string? ipAddress = null)
        {
            var user = await _authService.CreateUserAsync(username, password, fullName, "Student");
            if (user == null) return null;

            user.Classroom = classroom;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "student", managedBy, "เพิ่มนักเรียน",
                $"เพิ่มนักเรียนใหม่: {username} ({fullName})", ipAddress);

            await _notifications.NotifyAdminsAsync(
                "student",
                "นักเรียนใหม่",
                $"เพิ่มนักเรียน {fullName} (@{username})");

            return UserMapper.ToDto(user);
        }

        public async Task<List<UserResponseDto>> GetAllStudentsAsync()
        {
            var students = await _context.Users
                .Where(u => u.Role == "Student")
                .OrderBy(u => u.FullName)
                .ToListAsync();

            return students.Select(UserMapper.ToDto).ToList();
        }

        public async Task<UserResponseDto?> GetStudentByIdAsync(int studentId)
        {
            var student = await _context.Users
                .FirstOrDefaultAsync(u => u.Role == "Student" && u.Id == studentId);

            return student == null ? null : UserMapper.ToDto(student);
        }

        public async Task<UserResponseDto?> UpdateStudentAsync(
            int studentId, string fullName, string? classroom, string managedBy, string? ipAddress = null)
        {
            var student = await _context.Users
                .FirstOrDefaultAsync(u => u.Role == "Student" && u.Id == studentId);

            if (student == null) return null;

            student.FullName = fullName;
            student.Classroom = classroom;
            student.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "student", managedBy, "แก้ไขนักเรียน",
                $"แก้ไขข้อมูล {student.Username} เป็น {fullName}", ipAddress);

            return UserMapper.ToDto(student);
        }

        public async Task<bool> DeleteStudentAsync(int studentId, string managedBy, string? ipAddress = null)
        {
            var student = await _context.Users
                .FirstOrDefaultAsync(u => u.Role == "Student" && u.Id == studentId);

            if (student == null) return false;

            var transactions = await _context.Transactions
                .Where(t => t.StudentId == studentId)
                .ToListAsync();

            _context.Transactions.RemoveRange(transactions);
            _context.Users.Remove(student);
            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "student", managedBy, "ลบนักเรียน",
                $"ลบนักเรียน {student.Username} ({student.FullName})", ipAddress);

            return true;
        }

        public async Task<bool> DeleteTransactionAsync(int transactionId, string managedBy, string? ipAddress = null)
        {
            var transaction = await _context.Transactions
                .Include(t => t.Student)
                .FirstOrDefaultAsync(t => t.Id == transactionId);

            if (transaction == null) return false;

            var student = transaction.Student;

            if (transaction.TransactionType == "Deposit")
                student.Balance -= transaction.Amount;
            else if (transaction.TransactionType == "Withdraw")
                student.Balance += transaction.Amount;

            student.UpdatedAt = DateTime.UtcNow;

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "transaction", managedBy, "ลบรายการ",
                $"ลบรายการ #{transactionId} ของ {student.FullName}", ipAddress);

            return true;
        }

        private static TransactionResponseDto MapTransaction(Transaction t, string studentName) => new()
        {
            Id = t.Id,
            StudentId = t.StudentId,
            StudentName = studentName,
            TransactionType = t.TransactionType,
            Amount = t.Amount,
            TransactionDate = t.TransactionDate,
            ManagedBy = t.ManagedBy,
            Description = t.Description
        };

        private static string GetThaiMonthLabel(int year, int month)
        {
            var thaiMonths = new[] { "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค." };
            var label = month >= 1 && month <= 12 ? thaiMonths[month - 1] : month.ToString();
            return $"{label} {year + 543}";
        }
    }
}
