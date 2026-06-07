using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.DTOs.Settings;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;
using System.Text.Json;

namespace StudentSavingsSystem.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly ApplicationDbContext _context;
        private const string SettingsKey = "app_settings";

        public SettingsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SystemSettingsDto> GetSettingsAsync()
        {
            var row = await _context.SystemSettings.FindAsync(SettingsKey);
            if (row == null)
                return GetDefaultSettings();

            return JsonSerializer.Deserialize<SystemSettingsDto>(row.Value) ?? GetDefaultSettings();
        }

        public async Task<SystemSettingsDto> SaveSettingsAsync(SystemSettingsDto settings)
        {
            var json = JsonSerializer.Serialize(settings);
            var row = await _context.SystemSettings.FindAsync(SettingsKey);

            if (row == null)
            {
                _context.SystemSettings.Add(new SystemSetting
                {
                    Key = SettingsKey,
                    Value = json,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            else
            {
                row.Value = json;
                row.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return settings;
        }

        private static SystemSettingsDto GetDefaultSettings() => new()
        {
            SchoolName = "ระบบออมทรัพย์นักเรียน",
            Currency = "THB",
            Language = "th",
            Theme = "pink",
            Notifications = true,
            AutoBackup = true,
            BackupFrequency = "daily"
        };
    }
}
