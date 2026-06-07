using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentSavingsSystem.Models.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Student"; // Admin or Student

        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; } = 0;

        [MaxLength(255)]
        public string? QrCodeData { get; set; }

        [MaxLength(20)]
        public string? Classroom { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
