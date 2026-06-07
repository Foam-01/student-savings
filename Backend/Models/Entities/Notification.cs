using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentSavingsSystem.Models.Entities
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }

        [Required]
        [MaxLength(30)]
        public string Type { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
