namespace StudentSavingsSystem.DTOs.Settings
{
    public class SystemSettingsDto
    {
        public string SchoolName { get; set; } = "ระบบออมทรัพย์นักเรียน";
        public string Currency { get; set; } = "THB";
        public string Language { get; set; } = "th";
        public string Theme { get; set; } = "pink";
        public bool Notifications { get; set; } = true;
        public bool AutoBackup { get; set; } = true;
        public string BackupFrequency { get; set; } = "daily";
    }
}
