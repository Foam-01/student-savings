using StudentSavingsSystem.DTOs.Leaderboard;

namespace StudentSavingsSystem.Services
{
    public interface ILeaderboardService
    {
        Task<List<LeaderboardRowDto>> GetLeaderboardAsync(string sortBy = "balance", string? classroom = null);
        Task<LeaderboardRowDto?> GetStudentStreakAsync(int studentId);
    }
}
