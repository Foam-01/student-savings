using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;
using StudentSavingsSystem.DTOs.SavingGoal;

namespace StudentSavingsSystem.Services
{
    public class SavingGoalService : ISavingGoalService
    {
        private readonly ApplicationDbContext _context;
        private readonly IActivityLogService _activityLog;

        public SavingGoalService(ApplicationDbContext context, IActivityLogService activityLog)
        {
            _context = context;
            _activityLog = activityLog;
        }

        public async Task<List<SavingGoalResponseDto>> GetGoalsByStudentIdAsync(int studentId)
        {
            var goals = await _context.SavingGoals
                .Include(g => g.Student)
                .Where(g => g.StudentId == studentId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            return goals.Select(g => MapToDto(g, g.Student)).ToList();
        }

        public async Task<List<SavingGoalResponseDto>> GetAllGoalsAsync()
        {
            var goals = await _context.SavingGoals
                .Include(g => g.Student)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            return goals.Select(g => MapToDto(g, g.Student)).ToList();
        }

        public async Task<SavingGoalResponseDto?> CreateGoalAsync(int studentId, SavingGoalRequestDto request)
        {
            var student = await _context.Users.FindAsync(studentId);
            if (student == null || student.Role != "Student") return null;

            var goal = new SavingGoal
            {
                StudentId = studentId,
                Title = request.Title,
                Description = request.Description,
                TargetAmount = request.TargetAmount,
                TargetDate = request.TargetDate.HasValue ? DateTime.SpecifyKind(request.TargetDate.Value, DateTimeKind.Utc) : null,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.SavingGoals.Add(goal);
            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "saving_goal", 
                student.Username, 
                "สร้างเป้าหมายการออม", 
                $"นักเรียน {student.FullName} ได้ตั้งเป้าหมาย: {request.Title} ยอดออม {request.TargetAmount:N2} บาท"
            );

            return MapToDto(goal, student);
        }

        public async Task<SavingGoalResponseDto?> UpdateGoalAsync(int studentId, int goalId, SavingGoalRequestDto request)
        {
            var goal = await _context.SavingGoals
                .Include(g => g.Student)
                .FirstOrDefaultAsync(g => g.Id == goalId && g.StudentId == studentId);

            if (goal == null) return null;

            goal.Title = request.Title;
            goal.Description = request.Description;
            goal.TargetAmount = request.TargetAmount;
            goal.TargetDate = request.TargetDate.HasValue ? DateTime.SpecifyKind(request.TargetDate.Value, DateTimeKind.Utc) : null;
            goal.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(goal, goal.Student);
        }

        public async Task<bool> DeleteGoalAsync(int studentId, int goalId)
        {
            var goal = await _context.SavingGoals
                .Include(g => g.Student)
                .FirstOrDefaultAsync(g => g.Id == goalId);

            if (goal == null) return false;

            // Allow only the student owner or admin to delete (studentId check handled in controller)
            _context.SavingGoals.Remove(goal);
            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "saving_goal", 
                goal.Student.Username, 
                "ลบเป้าหมายการออม", 
                $"ลบเป้าหมาย: {goal.Title}"
            );

            return true;
        }

        public async Task<SavingGoalResponseDto?> ToggleGoalStatusAsync(int studentId, int goalId)
        {
            var goal = await _context.SavingGoals
                .Include(g => g.Student)
                .FirstOrDefaultAsync(g => g.Id == goalId && g.StudentId == studentId);

            if (goal == null) return null;

            goal.IsCompleted = !goal.IsCompleted;
            goal.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var statusLabel = goal.IsCompleted ? "สำเร็จแล้ว" : "ยังไม่สำเร็จ";
            await _activityLog.LogAsync(
                "saving_goal", 
                goal.Student.Username, 
                "เปลี่ยนสถานะเป้าหมาย", 
                $"เป้าหมาย: {goal.Title} เปลี่ยนสถานะเป็น {statusLabel}"
            );

            return MapToDto(goal, goal.Student);
        }

        private static SavingGoalResponseDto MapToDto(SavingGoal g, User student)
        {
            var currentSavings = student.Balance;
            var progress = 0.0;
            if (g.TargetAmount > 0)
            {
                progress = Math.Min(100.0, (double)(currentSavings / g.TargetAmount) * 100.0);
                progress = Math.Round(progress, 1);
            }

            return new SavingGoalResponseDto
            {
                Id = g.Id,
                StudentId = g.StudentId,
                StudentName = student.FullName,
                StudentUsername = student.Username,
                Title = g.Title,
                Description = g.Description,
                TargetAmount = g.TargetAmount,
                TargetDate = g.TargetDate,
                IsCompleted = g.IsCompleted,
                CreatedAt = g.CreatedAt,
                UpdatedAt = g.UpdatedAt,
                CurrentSavings = currentSavings,
                ProgressPercentage = progress
            };
        }
    }
}
