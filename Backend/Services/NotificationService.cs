using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.DTOs.Notification;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;

namespace StudentSavingsSystem.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task NotifyAdminsAsync(string type, string title, string message)
        {
            var adminIds = await _context.Users
                .Where(u => u.Role == "Admin")
                .Select(u => u.Id)
                .ToListAsync();

            foreach (var adminId in adminIds)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = adminId,
                    Type = type,
                    Title = title,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<NotificationDto>> GetNotificationsAsync(int? userId = null)
        {
            var query = _context.Notifications.AsQueryable();

            if (userId.HasValue)
                query = query.Where(n => n.UserId == null || n.UserId == userId);

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Type = n.Type,
                    Title = n.Title,
                    Message = n.Message,
                    Time = n.CreatedAt,
                    Read = n.IsRead
                })
                .ToListAsync();
        }

        public async Task<bool> MarkAsReadAsync(int id, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && (n.UserId == null || n.UserId == userId));

            if (notification == null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task MarkAllAsReadAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => (n.UserId == null || n.UserId == userId) && !n.IsRead)
                .ToListAsync();

            foreach (var n in notifications)
                n.IsRead = true;

            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task ClearAllAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == null || n.UserId == userId)
                .ToListAsync();

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
        }
    }
}
