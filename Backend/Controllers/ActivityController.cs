using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ActivityController : ControllerBase
    {
        private readonly IActivityLogService _activityLogService;

        public ActivityController(IActivityLogService activityLogService)
        {
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetActivities()
        {
            var activities = await _activityLogService.GetActivitiesAsync();
            return Ok(activities);
        }
    }
}
