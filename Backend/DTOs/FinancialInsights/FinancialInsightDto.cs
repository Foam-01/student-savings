using System.Collections.Generic;

namespace StudentSavingsSystem.DTOs.FinancialInsights
{
    public class FinancialInsightDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "success", "info", "warning", "primary"
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty; // "target", "flame", "alert", "trending-up", "bulb"
    }

    public class StudentAdvisorResponseDto
    {
        public decimal CurrentBalance { get; set; }
        public List<FinancialInsightDto> Insights { get; set; } = new();
    }
}
