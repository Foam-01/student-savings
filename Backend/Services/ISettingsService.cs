using StudentSavingsSystem.DTOs.Settings;

namespace StudentSavingsSystem.Services
{
    public interface ISettingsService
    {
        Task<SystemSettingsDto> GetSettingsAsync();
        Task<SystemSettingsDto> SaveSettingsAsync(SystemSettingsDto settings);
    }
}
