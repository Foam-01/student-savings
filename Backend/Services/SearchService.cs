using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.DTOs.Search;
using StudentSavingsSystem.Models;

namespace StudentSavingsSystem.Services
{
    public class SearchService : ISearchService
    {
        private readonly ApplicationDbContext _context;

        public SearchService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SearchResultDto>> SearchAsync(string term, bool isAdmin)
        {
            if (string.IsNullOrWhiteSpace(term))
                return new List<SearchResultDto>();

            var q = term.Trim().ToLower();
            var results = new List<SearchResultDto>();

            if (isAdmin)
            {
                var students = await _context.Users
                    .Where(u => u.Role == "Student" &&
                        (u.FullName.ToLower().Contains(q) || u.Username.ToLower().Contains(q)))
                    .Take(8)
                    .ToListAsync();

                results.AddRange(students.Select(s => new SearchResultDto
                {
                    Id = $"student-{s.Id}",
                    Type = "student",
                    Category = "นักเรียน",
                    Title = s.FullName,
                    Description = $"@{s.Username} · ยอดออม {s.Balance:N2} บาท",
                    Route = "/students",
                    Balance = s.Balance
                }));

                var transactions = await _context.Transactions
                    .Include(t => t.Student)
                    .Where(t =>
                        t.Student.FullName.ToLower().Contains(q) ||
                        t.TransactionType.ToLower().Contains(q) ||
                        (t.Description != null && t.Description.ToLower().Contains(q)))
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(8)
                    .ToListAsync();

                results.AddRange(transactions.Select(t => new SearchResultDto
                {
                    Id = $"tx-{t.Id}",
                    Type = "transaction",
                    Category = "รายการ",
                    Title = t.TransactionType == "Deposit" ? "ฝากเงิน" : "ถอนเงิน",
                    Description = $"{t.Student.FullName} · {t.Amount:N2} บาท",
                    Route = "/transactions"
                }));
            }

            var staticPages = new[]
            {
                new SearchResultDto { Id = "report-1", Type = "report", Category = "รายงาน", Title = "รายงานสรุป", Description = "ภาพรวมและสถิติระบบ", Route = "/reports" },
                new SearchResultDto { Id = "settings-1", Type = "setting", Category = "ตั้งค่า", Title = "ตั้งค่าระบบ", Description = "โปรไฟล์และผู้ดูแลระบบ", Route = "/settings" },
                new SearchResultDto { Id = "help-1", Type = "setting", Category = "ช่วยเหลือ", Title = "ศูนย์ช่วยเหลือ", Description = "คู่มือการใช้งาน", Route = "/help" },
                new SearchResultDto { Id = "activity-1", Type = "setting", Category = "ระบบ", Title = "บันทึกกิจกรรม", Description = "ประวัติการใช้งาน", Route = "/activity-log" },
            };

            results.AddRange(staticPages.Where(p =>
                p.Title.ToLower().Contains(q) || p.Description.ToLower().Contains(q)));

            return results;
        }
    }
}
