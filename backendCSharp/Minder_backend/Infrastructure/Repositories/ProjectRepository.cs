using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ProjectRepository(ApplicationDbContext context) : IProjectRepository
    {
        public async Task<List<ProjectEntity>?> GetProjectsAsync(Guid userId)
        {
            return await context.Project.Where(p => p.UserId == userId).ToListAsync();
        }

        public async Task<ProjectEntity?> GetProjectAsync(Guid projectId)
        {
            return await context.Project.FirstOrDefaultAsync(p => p.Id == projectId);
        }
    }

}
