using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentSavingsSystem.Models.Entities
{
    [Table("ActivityLogs")]
    public class ActivityLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(30)]
        public string Type { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Details { get; set; }

        [MaxLength(45)]
        public string? IpAddress { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
