using System.Threading.Tasks;
using StudentSavingsSystem.DTOs.SavingsBucket;

namespace StudentSavingsSystem.Services
{
    public interface ISavingsBucketService
    {
        Task<SavingsBucketSummaryDto?> GetStudentBucketsSummaryAsync(int studentId);
        Task<SavingsBucketResponseDto?> CreateBucketAsync(int studentId, SavingsBucketRequestDto request);
        Task<SavingsBucketResponseDto?> UpdateBucketAsync(int studentId, int bucketId, SavingsBucketRequestDto request);
        Task<bool> DeleteBucketAsync(int studentId, int bucketId);
        Task<SavingsBucketSummaryDto?> TransferFundsAsync(int studentId, int bucketId, SavingsBucketTransferDto transfer);
        Task<SavingsBucketSummaryDto?> AutoAllocateAsync(int studentId);
    }
}
