using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;
using StudentSavingsSystem.DTOs.Leaderboard;

namespace StudentSavingsSystem.Services
{
    public class LeaderboardService : ILeaderboardService
    {
        private readonly ApplicationDbContext _context;

        public LeaderboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        private static DateTime GetStartOfWeek(DateTime date)
        {
            int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-1 * diff).Date;
        }

        public async Task<List<LeaderboardRowDto>> GetLeaderboardAsync(string sortBy = "balance", string? classroom = null)
        {
            var studentsQuery = _context.Users.Where(u => u.Role == "Student");
            
            if (!string.IsNullOrEmpty(classroom) && classroom != "all")
            {
                studentsQuery = studentsQuery.Where(u => u.Classroom == classroom);
            }

            var students = await studentsQuery.ToListAsync();

            var studentIds = students.Select(s => s.Id).ToList();

            var deposits = await _context.Transactions
                .Where(t => t.TransactionType == "Deposit" && studentIds.Contains(t.StudentId))
                .ToListAsync();

            var leaderboard = new List<LeaderboardRowDto>();

            var groupedDeposits = deposits.GroupBy(t => t.StudentId).ToDictionary(g => g.Key, g => g.ToList());

            foreach (var student in students)
            {
                var studentDeposits = groupedDeposits.ContainsKey(student.Id) ? groupedDeposits[student.Id] : new List<Transaction>();
                
                var (currentStreak, maxStreak) = CalculateStreaks(studentDeposits);

                leaderboard.Add(new LeaderboardRowDto
                {
                    StudentId = student.Id,
                    StudentName = student.FullName,
                    StudentUsername = student.Username,
                    Classroom = student.Classroom,
                    TotalBalance = student.Balance,
                    DepositCount = studentDeposits.Count,
                    CurrentStreak = currentStreak,
                    MaxStreak = maxStreak
                });
            }

            // Sort
            IEnumerable<LeaderboardRowDto> sortedList = sortBy.ToLower() switch
            {
                "streak" => leaderboard.OrderByDescending(r => r.CurrentStreak).ThenByDescending(r => r.TotalBalance),
                "deposits" => leaderboard.OrderByDescending(r => r.DepositCount).ThenByDescending(r => r.TotalBalance),
                _ => leaderboard.OrderByDescending(r => r.TotalBalance).ThenByDescending(r => r.CurrentStreak)
            };

            var result = sortedList.ToList();

            // Assign ranks
            for (int i = 0; i < result.Count; i++)
            {
                result[i].Rank = i + 1;
            }

            return result;
        }

        public async Task<LeaderboardRowDto?> GetStudentStreakAsync(int studentId)
        {
            var student = await _context.Users.FindAsync(studentId);
            if (student == null || student.Role != "Student") return null;

            var deposits = await _context.Transactions
                .Where(t => t.TransactionType == "Deposit" && t.StudentId == studentId)
                .ToListAsync();

            var (currentStreak, maxStreak) = CalculateStreaks(deposits);

            return new LeaderboardRowDto
            {
                StudentId = student.Id,
                StudentName = student.FullName,
                StudentUsername = student.Username,
                Classroom = student.Classroom,
                TotalBalance = student.Balance,
                DepositCount = deposits.Count,
                CurrentStreak = currentStreak,
                MaxStreak = maxStreak
            };
        }

        private static (int CurrentStreak, int MaxStreak) CalculateStreaks(List<Transaction> deposits)
        {
            if (deposits == null || deposits.Count == 0) return (0, 0);

            var depositWeeks = deposits
                .Select(t => GetStartOfWeek(t.TransactionDate))
                .Distinct()
                .OrderBy(w => w)
                .ToList();

            if (depositWeeks.Count == 0) return (0, 0);

            // 1. Calculate Max Streak
            int maxStreak = 1;
            int currentRunning = 1;
            for (int i = 1; i < depositWeeks.Count; i++)
            {
                var diffDays = (depositWeeks[i] - depositWeeks[i - 1]).TotalDays;
                if (diffDays == 7)
                {
                    currentRunning++;
                    if (currentRunning > maxStreak)
                    {
                        maxStreak = currentRunning;
                    }
                }
                else if (diffDays > 7)
                {
                    currentRunning = 1;
                }
            }

            // 2. Calculate Current Streak
            int currentStreak = 0;
            var today = DateTime.UtcNow.Date;
            var currentWeekMonday = GetStartOfWeek(today);
            var lastWeekMonday = currentWeekMonday.AddDays(-7);

            var lastWeekIndex = depositWeeks.FindLastIndex(w => w == lastWeekMonday);
            var currentWeekIndex = depositWeeks.FindLastIndex(w => w == currentWeekMonday);

            if (currentWeekIndex != -1 || lastWeekIndex != -1)
            {
                // Streak is active. Start counting backwards from the most recent active week
                var startMonday = currentWeekIndex != -1 ? currentWeekMonday : lastWeekMonday;
                currentStreak = 1;
                var currentCheck = startMonday.AddDays(-7);

                while (depositWeeks.Contains(currentCheck))
                {
                    currentStreak++;
                    currentCheck = currentCheck.AddDays(-7);
                }
            }

            return (currentStreak, maxStreak);
        }
    }
}
