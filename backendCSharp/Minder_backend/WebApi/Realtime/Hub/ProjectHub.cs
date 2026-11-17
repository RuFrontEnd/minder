using Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace WebAPi.Realtime;

[Authorize]
public sealed class ProjectHub(IProjectRepository projectRepository) : Hub
{
    public async Task JoinProject(Guid projectId)
    {
        var userId = GetUserId();
        var membership = await projectRepository.GetProjectAsync(
            projectId,
            userId,
            Context.ConnectionAborted);

        if (membership is null)
        {
            throw new HubException("The user is not a member of this project.");
        }

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            GroupName(projectId), // 透過 project id 來區分不同的 client 端群組
            Context.ConnectionAborted);
    }

    public Task LeaveProject(Guid projectId) =>
        Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GroupName(projectId),
            Context.ConnectionAborted);

    public static string GroupName(Guid projectId) => $"project:{projectId:N}";

    private Guid GetUserId()
    {
        var userIdValue = Context.User?.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new HubException("The authenticated user is invalid.");
        }

        return userId;
    }
}

