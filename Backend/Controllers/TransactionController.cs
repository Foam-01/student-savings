using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using StudentSavingsSystem.DTOs.Transaction;
using StudentSavingsSystem.Helpers;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        private string GetUsername() => User.FindFirst(ClaimTypes.Name)?.Value ?? "system";

        [HttpPost("create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionRequestDto request)
        {
            var result = await _transactionService.CreateTransactionAsync(
                request, GetUsername(), HttpContext.GetClientIp());

            if (result == null)
                return BadRequest(new { message = "Failed to create transaction. Check student ID and balance." });

            return Ok(result);
        }

        [HttpGet("recent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRecentTransactions([FromQuery] int count = 10)
        {
            var transactions = await _transactionService.GetRecentTransactionsAsync(count);
            return Ok(transactions);
        }

        [HttpDelete("{transactionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTransaction(int transactionId)
        {
            var deleted = await _transactionService.DeleteTransactionAsync(
                transactionId, GetUsername(), HttpContext.GetClientIp());

            if (!deleted)
                return NotFound(new { message = "Transaction not found" });

            return Ok(new { message = "Transaction deleted successfully" });
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetStudentTransactions(int studentId)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (role == "Student")
            {
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized();

                if (userId != studentId)
                    return Forbid();
            }

            var transactions = await _transactionService.GetStudentTransactionsAsync(studentId);
            return Ok(transactions);
        }

        [HttpGet("dashboard")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDashboardStatistics()
        {
            var stats = await _transactionService.GetDashboardStatisticsAsync();
            return Ok(stats);
        }

        [HttpPost("student/create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentDto request)
        {
            var student = await _transactionService.CreateStudentAsync(
                request.Username,
                request.Password,
                request.FullName,
                request.Classroom,
                GetUsername(),
                HttpContext.GetClientIp());

            if (student == null)
                return BadRequest(new { message = "Username already exists" });

            return Ok(student);
        }

        [HttpGet("students")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _transactionService.GetAllStudentsAsync();
            return Ok(students);
        }

        [HttpPut("student/{studentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStudent(int studentId, [FromBody] UpdateStudentDto request)
        {
            var student = await _transactionService.UpdateStudentAsync(
                studentId, request.FullName, request.Classroom, GetUsername(), HttpContext.GetClientIp());

            if (student == null)
                return NotFound(new { message = "Student not found" });

            return Ok(student);
        }

        [HttpDelete("student/{studentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStudent(int studentId)
        {
            var deleted = await _transactionService.DeleteStudentAsync(
                studentId, GetUsername(), HttpContext.GetClientIp());

            if (!deleted)
                return NotFound(new { message = "Student not found" });

            return Ok(new { message = "Student deleted successfully" });
        }

        [HttpGet("student/{studentId}/details")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStudentDetails(int studentId)
        {
            var student = await _transactionService.GetStudentByIdAsync(studentId);

            if (student == null)
                return NotFound();

            return Ok(student);
        }

        [HttpGet("student/by-qr/{qrCodeData}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStudentByQrCode(string qrCodeData)
        {
            var students = await _transactionService.GetAllStudentsAsync();
            var student = students.FirstOrDefault(s => s.QrCodeData == qrCodeData);

            if (student == null)
                return NotFound(new { message = "Student not found" });

            return Ok(student);
        }
    }

    public class CreateStudentDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Classroom { get; set; }
    }
}
