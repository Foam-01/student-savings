using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using StudentSavingsSystem.DTOs.SavingGoal;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SavingGoalController : ControllerBase
    {
        private readonly ISavingGoalService _savingGoalService;

        public SavingGoalController(ISavingGoalService savingGoalService)
        {
            _savingGoalService = savingGoalService;
        }

        private int GetUserId() => int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out int id) ? id : 0;
        private string GetRole() => User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetStudentGoals(int studentId)
        {
            var role = GetRole();
            var currentUserId = GetUserId();

            if (role == "Student" && currentUserId != studentId)
            {
                return Forbid();
            }

            var goals = await _savingGoalService.GetGoalsByStudentIdAsync(studentId);
            return Ok(goals);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllGoals()
        {
            var goals = await _savingGoalService.GetAllGoalsAsync();
            return Ok(goals);
        }

        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateGoal([FromBody] SavingGoalRequestDto request)
        {
            var studentId = GetUserId();
            var result = await _savingGoalService.CreateGoalAsync(studentId, request);
            if (result == null)
            {
                return BadRequest(new { message = "ไม่สามารถสร้างเป้าหมายการออมได้" });
            }
            return Ok(result);
        }

        [HttpPut("{goalId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> UpdateGoal(int goalId, [FromBody] SavingGoalRequestDto request)
        {
            var studentId = GetUserId();
            var result = await _savingGoalService.UpdateGoalAsync(studentId, goalId, request);
            if (result == null)
            {
                return NotFound(new { message = "ไม่พบเป้าหมายการออม หรือไม่มีสิทธิ์แก้ไข" });
            }
            return Ok(result);
        }

        [HttpDelete("{goalId}")]
        public async Task<IActionResult> DeleteGoal(int goalId)
        {
            var role = GetRole();
            var currentUserId = GetUserId();

            // If it's a student, they must own the goal to delete it
            if (role == "Student")
            {
                var goals = await _savingGoalService.GetGoalsByStudentIdAsync(currentUserId);
                var belongsToMe = goals.Any(g => g.Id == goalId);
                if (!belongsToMe)
                {
                    return Forbid();
                }
            }

            var deleted = await _savingGoalService.DeleteGoalAsync(currentUserId, goalId);
            if (!deleted)
            {
                return NotFound(new { message = "ไม่พบเป้าหมายการออมที่ต้องการลบ" });
            }

            return Ok(new { message = "ลบเป้าหมายการออมสำเร็จ" });
        }

        [HttpPatch("{goalId}/toggle")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> ToggleGoalStatus(int goalId)
        {
            var studentId = GetUserId();
            var result = await _savingGoalService.ToggleGoalStatusAsync(studentId, goalId);
            if (result == null)
            {
                return NotFound(new { message = "ไม่พบเป้าหมายการออม หรือไม่มีสิทธิ์แก้ไข" });
            }
            return Ok(result);
        }
    }
}
