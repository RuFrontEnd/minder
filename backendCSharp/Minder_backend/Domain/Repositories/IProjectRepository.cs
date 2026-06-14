using Domain.Entities;

namespace Domain.Repositories
{
    public interface IProjectRepository
    {
        Task<List<ProjectEntity>?>GetProjectsAsync(Guid userId);
        Task<ProjectEntity?>GetProjectAsync(Guid projectId);
    }
}
