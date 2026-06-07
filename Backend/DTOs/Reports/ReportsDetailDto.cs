using StudentSavingsSystem.DTOs.Dashboard;

namespace StudentSavingsSystem.DTOs.Reports
{
    public class ReportsDetailDto
    {
        public DashboardDto Summary { get; set; } = new();
        public List<MonthlyStatisticsDto> MonthlyStatistics { get; set; } = new();
        public List<TopStudentDto> TopStudents { get; set; } = new();
        public List<ClassroomSummaryDto> ClassroomSummaries { get; set; } = new();
        public int TransactionsThisWeek { get; set; }
        public int TransactionsThisMonth { get; set; }
        public decimal NetSavings { get; set; }
    }
}
