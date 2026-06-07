using StudentSavingsSystem.DTOs.Notification;

namespace StudentSavingsSystem.Services
{
    public interface INotificationService
    {
        Task NotifyAdminsAsync(string type, string title, string message);
        Task<List<NotificationDto>> GetNotificationsAsync(int? userId = null);
        Task<bool> MarkAsReadAsync(int id, int userId);
        Task MarkAllAsReadAsync(int userId);
        Task<bool> DeleteAsync(int id);
        Task ClearAllAsync(int userId);
    }
}
