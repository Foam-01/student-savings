using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using StudentSavingsSystem.DTOs.Auth;
using StudentSavingsSystem.DTOs.User;
using StudentSavingsSystem.Helpers;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.Models.Entities;

namespace StudentSavingsSystem.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IActivityLogService _activityLog;

        public AuthService(
            ApplicationDbContext context,
            IConfiguration configuration,
            IActivityLogService activityLog)
        {
            _context = context;
            _configuration = configuration;
            _activityLog = activityLog;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, string? ipAddress = null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
                return null;

            if (!VerifyPassword(request.Password, user.PasswordHash))
                return null;

            var token = GenerateJwtToken(user);

            await _activityLog.LogAsync(
                "login",
                user.Username,
                "เข้าสู่ระบบ",
                $"{user.Role} เข้าสู่ระบบ",
                ipAddress);

            return new LoginResponseDto
            {
                Token = token,
                Username = user.Username,
                FullName = user.FullName,
                Role = user.Role,
                UserId = user.Id,
                Balance = user.Balance,
                QrCodeData = user.QrCodeData
            };
        }

        public async Task<User?> CreateUserAsync(string username, string password, string fullName, string role)
        {
            if (await _context.Users.AnyAsync(u => u.Username == username))
                return null;

            var user = new User
            {
                Username = username,
                PasswordHash = HashPassword(password),
                FullName = fullName,
                Role = role,
                Balance = 0,
                QrCodeData = role == "Student" ? GenerateQrCodeData(username) : null,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<List<UserResponseDto>> GetAllAdminsAsync()
        {
            var admins = await _context.Users
                .Where(u => u.Role == "Admin")
                .OrderBy(u => u.FullName)
                .ToListAsync();

            return admins.Select(UserMapper.ToDto).ToList();
        }

        public async Task<bool> DeleteAdminAsync(int adminId, int currentUserId)
        {
            if (adminId == currentUserId)
                return false;

            var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
            if (adminCount <= 1)
                return false;

            var admin = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == adminId && u.Role == "Admin");

            if (admin == null)
                return false;

            _context.Users.Remove(admin);
            await _context.SaveChangesAsync();

            await _activityLog.LogAsync(
                "security",
                "system",
                "ลบผู้ดูแลระบบ",
                $"ลบ Admin: {admin.Username}");

            return true;
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            if (string.IsNullOrEmpty(secretKey))
                throw new InvalidOperationException("JWT SecretKey is not configured");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateQrCodeData(string username)
        {
            return $"STU-{username.ToUpper()}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
    }
}
