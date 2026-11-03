using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ProjectRepository(ApplicationDbContext context) : IProjectRepository
    {
        public async Task<List<ProjectEntity>> GetProjectsAsync(
            Guid userId,
            CancellationToken cancellationToken)
        {
            return await context.Projects
                .Where(project => project.UserId == userId)
                .ToListAsync(cancellationToken);
        }

        public async Task<ProjectEntity?> GetProjectAsync(
            Guid projectId,
            Guid userId,
            CancellationToken cancellationToken)
        {
            return await context.Projects.FirstOrDefaultAsync(
                project => project.Id == projectId && project.UserId == userId,
                cancellationToken);
        }

        public async Task<ProjectEntity> AddProjectAsync(
            ProjectEntity project,
            CancellationToken cancellationToken)
        {
            await context.Projects.AddAsync(project, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            return project;
        }

        public async Task<ProjectEntity?> UpdateProjectNameAsync(
            Guid projectId,
            Guid userId,
            string name,
            CancellationToken cancellationToken)
        {
            var project = await GetProjectAsync(projectId, userId, cancellationToken);
            if (project is null) return null;

            project.Rename(name);
            await context.SaveChangesAsync(cancellationToken);
            return project;
        }
    }

}
