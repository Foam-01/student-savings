namespace StudentSavingsSystem.DTOs.Transaction
{
    public class TransactionResponseDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? ManagedBy { get; set; }
        public string? Description { get; set; }
    }
}
