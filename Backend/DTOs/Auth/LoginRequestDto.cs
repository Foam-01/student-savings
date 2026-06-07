using System.ComponentModel.DataAnnotations;

namespace StudentSavingsSystem.DTOs.Auth
{
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Username is required")]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MaxLength(100)]
        public string Password { get; set; } = string.Empty;
    }
}
