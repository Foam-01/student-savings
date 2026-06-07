using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentSavingsSystem.DTOs.Reports;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ReportsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public ReportsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet("detail")]
        public async Task<IActionResult> GetDetail([FromQuery] string range = "month")
        {
            var report = await _transactionService.GetReportsDetailAsync(range);
            return Ok(report);
        }
    }
}
