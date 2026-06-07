using StudentSavingsSystem.DTOs.Dashboard;
using StudentSavingsSystem.DTOs.Reports;
using StudentSavingsSystem.DTOs.Transaction;
using StudentSavingsSystem.DTOs.User;
using StudentSavingsSystem.Models.Entities;

namespace StudentSavingsSystem.Services
{
    public interface ITransactionService
    {
        Task<TransactionResponseDto?> CreateTransactionAsync(TransactionRequestDto request, string managedBy, string? ipAddress = null);
        Task<List<TransactionResponseDto>> GetRecentTransactionsAsync(int count = 10);
        Task<List<TransactionResponseDto>> GetStudentTransactionsAsync(int studentId);
        Task<DashboardDto> GetDashboardStatisticsAsync();
        Task<ReportsDetailDto> GetReportsDetailAsync(string range = "month");
        Task<UserResponseDto?> CreateStudentAsync(string username, string password, string fullName, string? classroom, string managedBy, string? ipAddress = null);
        Task<List<UserResponseDto>> GetAllStudentsAsync();
        Task<UserResponseDto?> GetStudentByIdAsync(int studentId);
        Task<UserResponseDto?> UpdateStudentAsync(int studentId, string fullName, string? classroom, string managedBy, string? ipAddress = null);
        Task<bool> DeleteStudentAsync(int studentId, string managedBy, string? ipAddress = null);
        Task<bool> DeleteTransactionAsync(int transactionId, string managedBy, string? ipAddress = null);
    }
}
