using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using StudentSavingsSystem.DTOs.SavingsBucket;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SavingsBucketController : ControllerBase
    {
        private readonly ISavingsBucketService _savingsBucketService;

        public SavingsBucketController(ISavingsBucketService savingsBucketService)
        {
            _savingsBucketService = savingsBucketService;
        }

        private int GetUserId() => int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out int id) ? id : 0;
        private string GetRole() => User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        [HttpGet("summary")]
        public async Task<IActionResult> GetMySummary()
        {
            var role = GetRole();
            var userId = GetUserId();

            if (role != "Student")
            {
                return BadRequest(new { message = "ผู้ดูแลระบบกรุณาระบุรหัสนักเรียนในการตรวจสอบข้อมูลกระปุกออมเงิน" });
            }

            var summary = await _savingsBucketService.GetStudentBucketsSummaryAsync(userId);
            if (summary == null) return NotFound(new { message = "ไม่พบข้อมูลกระปุกออมเงิน" });

            return Ok(summary);
        }

        [HttpGet("summary/{studentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStudentSummary(int studentId)
        {
            var summary = await _savingsBucketService.GetStudentBucketsSummaryAsync(studentId);
            if (summary == null) return NotFound(new { message = "ไม่พบข้อมูลกระปุกออมเงินของนักเรียน" });

            return Ok(summary);
        }

        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateBucket([FromBody] SavingsBucketRequestDto request)
        {
            var studentId = GetUserId();
            var result = await _savingsBucketService.CreateBucketAsync(studentId, request);
            if (result == null)
            {
                return BadRequest(new { message = "ไม่สามารถสร้างกระปุกออมเงินย่อยได้" });
            }
            return Ok(result);
        }

        [HttpPut("{bucketId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> UpdateBucket(int bucketId, [FromBody] SavingsBucketRequestDto request)
        {
            var studentId = GetUserId();
            var result = await _savingsBucketService.UpdateBucketAsync(studentId, bucketId, request);
            if (result == null)
            {
                return NotFound(new { message = "ไม่พบกระปุกออมเงิน หรือไม่มีสิทธิ์แก้ไข" });
            }
            return Ok(result);
        }

        [HttpDelete("{bucketId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> DeleteBucket(int bucketId)
        {
            var studentId = GetUserId();
            var deleted = await _savingsBucketService.DeleteBucketAsync(studentId, bucketId);
            if (!deleted)
            {
                return NotFound(new { message = "ไม่พบกระปุกออมเงินที่ต้องการลบ" });
            }
            return Ok(new { message = "ลบกระปุกออมเงินและคืนเงินเข้าบัญชีหลักสำเร็จ" });
        }

        [HttpPost("{bucketId}/transfer")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> TransferFunds(int bucketId, [FromBody] SavingsBucketTransferDto request)
        {
            var studentId = GetUserId();
            try
            {
                var result = await _savingsBucketService.TransferFundsAsync(studentId, bucketId, request);
                if (result == null)
                {
                    return BadRequest(new { message = "ไม่สามารถดำเนินการโอนย้ายเงินได้" });
                }
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("auto-allocate")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> AutoAllocate()
        {
            var studentId = GetUserId();
            try
            {
                var result = await _savingsBucketService.AutoAllocateAsync(studentId);
                if (result == null)
                {
                    return BadRequest(new { message = "ไม่สามารถจัดสรรงบประมาณเงินออมได้" });
                }
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
