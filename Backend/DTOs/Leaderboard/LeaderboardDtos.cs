using System;

namespace StudentSavingsSystem.DTOs.Leaderboard
{
    public class LeaderboardRowDto
    {
        public int Rank { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentUsername { get; set; } = string.Empty;
        public string? Classroom { get; set; }
        public decimal TotalBalance { get; set; }
        public int DepositCount { get; set; }
        public int CurrentStreak { get; set; }
        public int MaxStreak { get; set; }
    }
}
