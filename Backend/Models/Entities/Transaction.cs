using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentSavingsSystem.Models.Entities
{
    [Table("Transactions")]
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int StudentId { get; set; }

        [ForeignKey("StudentId")]
        public User Student { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string TransactionType { get; set; } = string.Empty; // Deposit or Withdraw

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? ManagedBy { get; set; } // Admin username who managed this transaction

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}
