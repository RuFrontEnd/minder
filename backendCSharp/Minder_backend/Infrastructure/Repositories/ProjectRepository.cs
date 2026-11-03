using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ProjectRepository(ApplicationDbContext context) : IProjectRepository
    {
        public async Task<List<ProjectMembership>> GetProjectsAsync(
            Guid userId,
            CancellationToken cancellationToken)
        {
            return await (
                from member in context.Members
                join project in context.Projects on member.ProjectId equals project.Id
                join role in context.Roles on member.RoleId equals role.Id
                where member.UserId == userId
                select new ProjectMembership(project, role.Name)
            )
                .ToListAsync(cancellationToken);
        }

        public async Task<ProjectMembership?> GetProjectAsync(
            Guid projectId,
            Guid userId,
            CancellationToken cancellationToken)
        {
            return await (
                from member in context.Members
                join project in context.Projects on member.ProjectId equals project.Id
                join role in context.Roles on member.RoleId equals role.Id
                where member.UserId == userId && project.Id == projectId
                select new ProjectMembership(project, role.Name)
            ).FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<ProjectEntity> AddProjectAsync(
            ProjectEntity project,
            CancellationToken cancellationToken)
        {
            await context.Projects.AddAsync(project, cancellationToken);
            await context.Members.AddAsync(
                new MemberEntity(project.UserId, project.Id, RoleEntity.OwnerId),
                cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            return project;
        }

        public async Task<ProjectMembership?> UpdateProjectNameAsync(
            Guid projectId,
            Guid userId,
            string name,
            CancellationToken cancellationToken)
        {
            var membership = await GetProjectAsync(projectId, userId, cancellationToken);
            if (membership is null) return null;

            membership.Project.Rename(name);
            await context.SaveChangesAsync(cancellationToken);
            return membership;
        }

        public async Task<bool> DeleteProjectAsync(
            Guid projectId,
            Guid userId,
            CancellationToken cancellationToken)
        {
            var membership = await (
                from member in context.Members
                join project in context.Projects on member.ProjectId equals project.Id
                join role in context.Roles on member.RoleId equals role.Id
                where member.UserId == userId
                    && project.Id == projectId
                    && role.Name == "owner"
                select project
            ).FirstOrDefaultAsync(cancellationToken);

            if (membership is null) return false;

            context.Projects.Remove(membership);
            await context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }

}
