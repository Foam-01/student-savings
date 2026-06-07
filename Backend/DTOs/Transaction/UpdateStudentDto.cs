namespace StudentSavingsSystem.DTOs.Transaction
{
    public class UpdateStudentDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? Classroom { get; set; }
    }
}
