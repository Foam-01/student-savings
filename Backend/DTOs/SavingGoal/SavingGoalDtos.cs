using System;

namespace StudentSavingsSystem.DTOs.SavingGoal
{
    public class SavingGoalRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal TargetAmount { get; set; }
        public DateTime? TargetDate { get; set; }
    }

    public class SavingGoalResponseDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentUsername { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal TargetAmount { get; set; }
        public DateTime? TargetDate { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Dynamic calculations based on student balance
        public decimal CurrentSavings { get; set; }
        public double ProgressPercentage { get; set; }
    }
}
