using StudentSavingsSystem.DTOs.Activity;

namespace StudentSavingsSystem.Services
{
    public interface IActivityLogService
    {
        Task LogAsync(string type, string userName, string action, string? details = null, string? ipAddress = null);
        Task<List<ActivityLogDto>> GetActivitiesAsync();
    }
}
