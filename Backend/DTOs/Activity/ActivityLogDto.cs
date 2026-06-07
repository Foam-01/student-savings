namespace StudentSavingsSystem.DTOs.Activity
{
    public class ActivityLogDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string User { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Ip { get; set; } = string.Empty;
    }
}
