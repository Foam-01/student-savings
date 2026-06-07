using StudentSavingsSystem.DTOs.User;
using StudentSavingsSystem.Models.Entities;

namespace StudentSavingsSystem.Helpers
{
    public static class UserMapper
    {
        public static UserResponseDto ToDto(User user) => new()
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            Balance = user.Balance,
            QrCodeData = user.QrCodeData,
            Classroom = user.Classroom,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
