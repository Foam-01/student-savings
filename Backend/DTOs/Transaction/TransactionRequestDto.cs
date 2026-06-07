using System.ComponentModel.DataAnnotations;

namespace StudentSavingsSystem.DTOs.Transaction
{
    public class TransactionRequestDto
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }

        [Required(ErrorMessage = "Transaction Type is required")]
        [MaxLength(20)]
        public string TransactionType { get; set; } = string.Empty; // Deposit or Withdraw

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}
