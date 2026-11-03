using Domain.Entities;

namespace Domain.Repositories
{
    public sealed record ProjectMembership(ProjectEntity Project, string Role);

    public interface IProjectRepository
    {
        Task<List<ProjectMembership>> GetProjectsAsync(Guid userId, CancellationToken cancellationToken);
        Task<ProjectMembership?> GetProjectAsync(Guid projectId, Guid userId, CancellationToken cancellationToken);
        Task<ProjectEntity> AddProjectAsync(ProjectEntity project, CancellationToken cancellationToken);
        Task<ProjectMembership?> UpdateProjectNameAsync(Guid projectId, Guid userId, string name, CancellationToken cancellationToken);
        Task<bool> DeleteProjectAsync(Guid projectId, Guid userId, CancellationToken cancellationToken);
    }
}
