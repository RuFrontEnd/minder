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

        public async Task<AddProjectMemberResult> AddMemberAsync(
            Guid projectId,
            Guid requesterId,
            Guid targetUserId,
            CancellationToken cancellationToken)
        {
            var isMember = await context.Members.AnyAsync(
                member => member.ProjectId == projectId
                    && member.UserId == requesterId,
                cancellationToken);

            if (!isMember) return AddProjectMemberResult.ProjectNotFoundOrNotOwner;

            var userExists = await context.Users
                .AnyAsync(user => user.Id == targetUserId, cancellationToken);
            if (!userExists) return AddProjectMemberResult.UserNotFound;

            var alreadyMember = await context.Members
                .AnyAsync(
                    member => member.ProjectId == projectId
                        && member.UserId == targetUserId,
                    cancellationToken);
            if (alreadyMember) return AddProjectMemberResult.AlreadyMember;

            await context.Members.AddAsync(
                new MemberEntity(targetUserId, projectId, RoleEntity.MemberId),
                cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            return AddProjectMemberResult.Added;
        }

        public async Task<List<ProjectMember>?> GetMembersAsync(
            Guid projectId,
            Guid requesterId,
            CancellationToken cancellationToken)
        {
            var isMember = await context.Members.AnyAsync(
                member => member.ProjectId == projectId
                    && member.UserId == requesterId,
                cancellationToken);
            if (!isMember) return null;

            return await (
                from member in context.Members
                join user in context.Users on member.UserId equals user.Id
                join role in context.Roles on member.RoleId equals role.Id
                where member.ProjectId == projectId
                orderby role.Name, user.Email
                select new ProjectMember(
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.AvatarUrl,
                    user.AvatarColor == null ? null : user.AvatarColor.Color,
                    user.AvatarColor == null ? null : user.AvatarColor.BackgroundColor,
                    role.Name)
            ).ToListAsync(cancellationToken);
        }

        public async Task<RemoveProjectMemberResult> RemoveMemberAsync(
            Guid projectId,
            Guid requesterId,
            Guid targetUserId,
            CancellationToken cancellationToken)
        {
            var isOwner = await (
                from member in context.Members
                join role in context.Roles on member.RoleId equals role.Id
                where member.ProjectId == projectId
                    && member.UserId == requesterId
                    && role.Name == "owner"
                select member.Id
            ).AnyAsync(cancellationToken);

            if (!isOwner) return RemoveProjectMemberResult.ProjectNotFoundOrNotOwner;

            var targetMember = await context.Members
                .FirstOrDefaultAsync(
                    member => member.ProjectId == projectId
                        && member.UserId == targetUserId,
                    cancellationToken);
            if (targetMember is null) return RemoveProjectMemberResult.MemberNotFound;
            if (targetMember.RoleId == RoleEntity.OwnerId)
            {
                return RemoveProjectMemberResult.CannotRemoveOwner;
            }

            context.Members.Remove(targetMember);
            await context.SaveChangesAsync(cancellationToken);
            return RemoveProjectMemberResult.Removed;
        }
    }

}
