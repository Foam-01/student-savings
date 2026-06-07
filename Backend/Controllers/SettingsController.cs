using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentSavingsSystem.DTOs.Settings;
using StudentSavingsSystem.Services;

namespace StudentSavingsSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingsService _settingsService;

        public SettingsController(ISettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _settingsService.GetSettingsAsync();
            return Ok(settings);
        }

        [HttpPut]
        public async Task<IActionResult> SaveSettings([FromBody] SystemSettingsDto settings)
        {
            var saved = await _settingsService.SaveSettingsAsync(settings);
            return Ok(saved);
        }
    }
}
