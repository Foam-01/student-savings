using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.DTOs.Activity;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;

namespace StudentSavingsSystem.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string type, string userName, string action, string? details = null, string? ipAddress = null)
        {
            _context.ActivityLogs.Add(new ActivityLog
            {
                Type = type,
                UserName = userName,
                Action = action,
                Details = details,
                IpAddress = ipAddress ?? "127.0.0.1",
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }

        public async Task<List<ActivityLogDto>> GetActivitiesAsync()
        {
            return await _context.ActivityLogs
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new ActivityLogDto
                {
                    Id = a.Id,
                    Type = a.Type,
                    User = a.UserName,
                    Action = a.Action,
                    Details = a.Details ?? string.Empty,
                    Timestamp = a.CreatedAt,
                    Ip = a.IpAddress ?? string.Empty
                })
                .ToListAsync();
        }
    }
}
