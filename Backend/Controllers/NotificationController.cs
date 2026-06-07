using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var notifications = await _notificationService.GetNotificationsAsync(GetUserId());
            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var ok = await _notificationService.MarkAsReadAsync(id, GetUserId());
            if (!ok) return NotFound();
            return Ok();
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            await _notificationService.MarkAllAsReadAsync(GetUserId());
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _notificationService.DeleteAsync(id);
            if (!ok) return NotFound();
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> ClearAll()
        {
            await _notificationService.ClearAllAsync(GetUserId());
            return Ok();
        }
    }
}
