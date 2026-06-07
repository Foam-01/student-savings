using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentSavingsSystem.Models.Entities
{
    [Table("SavingsBuckets")]
    public class SavingsBucket
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string Icon { get; set; } = "archive"; // Default icons: book, target, wallet, gamepad, heart, etc.

        [Column(TypeName = "decimal(18,2)")]
        public decimal AllocatedAmount { get; set; } = 0m;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("StudentId")]
        public User Student { get; set; } = null!;
    }
}
