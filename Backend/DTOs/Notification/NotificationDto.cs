namespace StudentSavingsSystem.DTOs.Notification
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Time { get; set; }
        public bool Read { get; set; }
    }
}
