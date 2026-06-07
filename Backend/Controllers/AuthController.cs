using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using StudentSavingsSystem.DTOs.Auth;
using StudentSavingsSystem.Helpers;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request, HttpContext.GetClientIp());

            if (result == null)
                return Unauthorized(new { message = "Invalid username or password" });

            return Ok(new
            {
                token = result.Token,
                user = new
                {
                    id = result.UserId,
                    username = result.Username,
                    fullName = result.FullName,
                    role = result.Role,
                    balance = result.Balance,
                    qrCodeData = result.QrCodeData
                }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var user = await _authService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound();

            return Ok(UserMapper.ToDto(user));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admins")]
        public async Task<IActionResult> GetAdmins()
        {
            var admins = await _authService.GetAllAdminsAsync();
            return Ok(admins);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("register-admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterDto request)
        {
            var user = await _authService.CreateUserAsync(request.Username, request.Password, request.FullName, "Admin");

            if (user == null)
                return BadRequest(new { message = "Username already exists" });

            return Ok(UserMapper.ToDto(user));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{adminId}")]
        public async Task<IActionResult> DeleteAdmin(int adminId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (adminId == currentUserId)
                return BadRequest(new { message = "Cannot delete your own account" });

            var deleted = await _authService.DeleteAdminAsync(adminId, currentUserId);
            if (!deleted)
                return BadRequest(new { message = "Cannot delete admin. At least one admin must remain." });

            return Ok(new { message = "Admin deleted successfully" });
        }
    }

    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }
}
