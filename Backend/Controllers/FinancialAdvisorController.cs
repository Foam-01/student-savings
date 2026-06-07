using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FinancialAdvisorController : ControllerBase
    {
        private readonly IFinancialInsightsService _financialInsightsService;

        public FinancialAdvisorController(IFinancialInsightsService financialInsightsService)
        {
            _financialInsightsService = financialInsightsService;
        }

        private int GetUserId() => int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out int id) ? id : 0;
        private string GetRole() => User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        [HttpGet("insights")]
        public async Task<IActionResult> GetMyInsights()
        {
            var role = GetRole();
            var userId = GetUserId();

            if (role != "Student")
            {
                return BadRequest(new { message = "ผู้ดูแลระบบกรุณาระบุรหัสนักเรียนในการตรวจสอบข้อแนะนำ" });
            }

            var insights = await _financialInsightsService.GetStudentInsightsAsync(userId);
            return Ok(insights);
        }

        [HttpGet("insights/{studentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStudentInsights(int studentId)
        {
            var insights = await _financialInsightsService.GetStudentInsightsAsync(studentId);
            return Ok(insights);
        }
    }
}
