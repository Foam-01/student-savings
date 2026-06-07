using System.Threading.Tasks;
using StudentSavingsSystem.DTOs.FinancialInsights;

namespace StudentSavingsSystem.Services
{
    public interface IFinancialInsightsService
    {
        Task<StudentAdvisorResponseDto> GetStudentInsightsAsync(int studentId);
    }
}
