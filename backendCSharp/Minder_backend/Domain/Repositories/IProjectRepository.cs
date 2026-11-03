using Domain.Entities;

namespace Domain.Repositories
{
    public sealed record ProjectMembership(ProjectEntity Project, string Role);
    public sealed record ProjectMember(
        Guid UserId,
        string Email,
        string FirstName,
        string LastName,
        string? AvatarUrl,
        string? AvatarColor,
        string? AvatarBackgroundColor,
        string Role);
    public enum AddProjectMemberResult
    {
        Added,
        ProjectNotFoundOrNotOwner,
        UserNotFound,
        AlreadyMember
    }

    public enum RemoveProjectMemberResult
    {
        Removed,
        ProjectNotFoundOrNotOwner,
        MemberNotFound,
        CannotRemoveOwner
    }

    public interface IProjectRepository
    {
        Task<List<ProjectMembership>> GetProjectsAsync(Guid userId, CancellationToken cancellationToken);
        Task<ProjectMembership?> GetProjectAsync(Guid projectId, Guid userId, CancellationToken cancellationToken);
        Task<ProjectEntity> AddProjectAsync(ProjectEntity project, CancellationToken cancellationToken);
        Task<ProjectMembership?> UpdateProjectNameAsync(Guid projectId, Guid userId, string name, CancellationToken cancellationToken);
        Task<bool> DeleteProjectAsync(Guid projectId, Guid userId, CancellationToken cancellationToken);
        Task<AddProjectMemberResult> AddMemberAsync(
            Guid projectId,
            Guid requesterId,
            Guid targetUserId,
            CancellationToken cancellationToken);
        Task<List<ProjectMember>?> GetMembersAsync(
            Guid projectId,
            Guid requesterId,
            CancellationToken cancellationToken);
        Task<RemoveProjectMemberResult> RemoveMemberAsync(
            Guid projectId,
            Guid requesterId,
            Guid targetUserId,
            CancellationToken cancellationToken);
    }
}
