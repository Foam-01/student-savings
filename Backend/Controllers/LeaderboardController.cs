using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardService _leaderboardService;

        public LeaderboardController(ILeaderboardService leaderboardService)
        {
            _leaderboardService = leaderboardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLeaderboard(
            [FromQuery] string sortBy = "balance", 
            [FromQuery] string? classroom = null)
        {
            var leaderboard = await _leaderboardService.GetLeaderboardAsync(sortBy, classroom);
            return Ok(leaderboard);
        }

        [HttpGet("student/{studentId}/streak")]
        public async Task<IActionResult> GetStudentStreak(int studentId)
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "Student")
            {
                if (string.IsNullOrEmpty(currentUserIdClaim) || !int.TryParse(currentUserIdClaim, out int currentUserId) || currentUserId != studentId)
                {
                    return Forbid();
                }
            }

            var streakData = await _leaderboardService.GetStudentStreakAsync(studentId);
            if (streakData == null)
            {
                return NotFound(new { message = "ไม่พบข้อมูลนักเรียน" });
            }

            return Ok(streakData);
        }
    }
}
