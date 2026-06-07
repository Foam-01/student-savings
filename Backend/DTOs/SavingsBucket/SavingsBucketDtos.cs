using System;
using System.Collections.Generic;

namespace StudentSavingsSystem.DTOs.SavingsBucket
{
    public class SavingsBucketResponseDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Icon { get; set; } = "archive";
        public decimal AllocatedAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class SavingsBucketRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Icon { get; set; } = "archive";
    }

    public class SavingsBucketTransferDto
    {
        public decimal Amount { get; set; }
        public string Direction { get; set; } = "allocate"; // "allocate" or "deallocate"
    }

    public class SavingsBucketSummaryDto
    {
        public decimal TotalBalance { get; set; }
        public decimal UnallocatedBalance { get; set; }
        public decimal AllocatedBalance { get; set; }
        public List<SavingsBucketResponseDto> Buckets { get; set; } = new();
    }
}
