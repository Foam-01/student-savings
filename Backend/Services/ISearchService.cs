using StudentSavingsSystem.DTOs.Search;

namespace StudentSavingsSystem.Services
{
    public interface ISearchService
    {
        Task<List<SearchResultDto>> SearchAsync(string term, bool isAdmin);
    }
}
