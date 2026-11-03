using Domain.Entities;

namespace Domain.Repositories
{
    public interface IProjectRepository
    {
        Task<List<ProjectEntity>> GetProjectsAsync(Guid userId, CancellationToken cancellationToken);
        Task<ProjectEntity?> GetProjectAsync(Guid projectId, Guid userId, CancellationToken cancellationToken);
        Task<ProjectEntity> AddProjectAsync(ProjectEntity project, CancellationToken cancellationToken);
    }
}
