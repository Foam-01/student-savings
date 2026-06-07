using StudentSavingsSystem.DTOs.Auth;
using StudentSavingsSystem.DTOs.User;
using StudentSavingsSystem.Models.Entities;

namespace StudentSavingsSystem.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, string? ipAddress = null);
        Task<User?> CreateUserAsync(string username, string password, string fullName, string role);
        Task<User?> GetUserByIdAsync(int userId);
        Task<List<UserResponseDto>> GetAllAdminsAsync();
        Task<bool> DeleteAdminAsync(int adminId, int currentUserId);
    }
}
