using StudentSavingsSystem.DTOs.SavingGoal;

namespace StudentSavingsSystem.Services
{
    public interface ISavingGoalService
    {
        Task<List<SavingGoalResponseDto>> GetGoalsByStudentIdAsync(int studentId);
        Task<List<SavingGoalResponseDto>> GetAllGoalsAsync();
        Task<SavingGoalResponseDto?> CreateGoalAsync(int studentId, SavingGoalRequestDto request);
        Task<SavingGoalResponseDto?> UpdateGoalAsync(int studentId, int goalId, SavingGoalRequestDto request);
        Task<bool> DeleteGoalAsync(int studentId, int goalId);
        Task<SavingGoalResponseDto?> ToggleGoalStatusAsync(int studentId, int goalId);
    }
}
