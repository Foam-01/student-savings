namespace StudentSavingsSystem.DTOs.Dashboard
{
    public class DashboardDto
    {
        public decimal TotalBalance { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTransactions { get; set; }
        public decimal TotalDeposits { get; set; }
        public decimal TotalWithdrawals { get; set; }
        public int TodayTransactions { get; set; }
        public decimal TodayDeposits { get; set; }
        public decimal AverageBalance { get; set; }
        public List<MonthlyStatisticsDto> MonthlyStatistics { get; set; } = new();
        public List<TopStudentDto> TopStudents { get; set; } = new();
        public List<ClassroomSummaryDto> ClassroomSummaries { get; set; } = new();
    }

    public class MonthlyStatisticsDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal DepositAmount { get; set; }
        public decimal WithdrawAmount { get; set; }
    }

    public class TopStudentDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Classroom { get; set; }
        public decimal Balance { get; set; }
    }

    public class ClassroomSummaryDto
    {
        public string Classroom { get; set; } = string.Empty;
        public int StudentCount { get; set; }
        public decimal TotalBalance { get; set; }
    }
}
