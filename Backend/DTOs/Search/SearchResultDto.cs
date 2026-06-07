namespace StudentSavingsSystem.DTOs.Search
{
    public class SearchResultDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public decimal? Balance { get; set; }
    }
}
