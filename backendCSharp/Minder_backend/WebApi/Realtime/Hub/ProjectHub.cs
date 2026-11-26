using Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace WebAPi.Realtime;

[Authorize]
public sealed class ProjectHub(
    IProjectRepository projectRepository,
    ProjectCursorBroadcaster cursorBroadcaster) : Hub
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

        var members = await projectRepository.GetMembersAsync(
            projectId,
            userId,
            Context.ConnectionAborted);
        var currentMember = members?.SingleOrDefault(member => member.UserId == userId);
        if (currentMember is null)
        {
            throw new HubException("The project members could not be loaded.");
        }

        await Groups.AddToGroupAsync(
            Context.ConnectionId, // 辨別 client 端
            GroupName(projectId), // 透過 project id 來區分不同的 client 端群組，形成不同的群組
            Context.ConnectionAborted);
        Context.Items[ProjectKey(projectId)] = true;

        await Clients.Caller.SendAsync(
            "projectUsers",
            members,
            Context.ConnectionAborted);
        await Clients.OthersInGroup(GroupName(projectId)).SendAsync(
            "projectUserJoined",
            currentMember,
            Context.ConnectionAborted);
    }

    public async Task LeaveProject(Guid projectId)
    {
        if (!IsJoined(projectId))
        {
            return;
        }

        Context.Items.Remove(ProjectKey(projectId));
        cursorBroadcaster.Remove(projectId, Context.ConnectionId);
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GroupName(projectId),
            Context.ConnectionAborted);
        await Clients.Group(GroupName(projectId)).SendAsync(
            "projectUserLeft",
            GetUserId(),
            Context.ConnectionAborted);
    }

    public Task UpdateCursor(Guid projectId, CursorPosition position)
    {
        if (!IsJoined(projectId))
        {
            throw new HubException("The connection has not joined this project.");
        }

        cursorBroadcaster.Update(projectId, Context.ConnectionId, GetUserId(), position);
        return Task.CompletedTask;
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        var joinedProjects = Context.Items.Keys
            .OfType<string>()
            .Where(key => key.StartsWith("joined:", StringComparison.Ordinal))
            .Select(key => Guid.TryParse(key["joined:".Length..], out var projectId)
                ? projectId
                : (Guid?)null)
            .Where(projectId => projectId.HasValue)
            .Select(projectId => projectId!.Value)
            .ToList();

        foreach (var projectId in joinedProjects)
        {
            cursorBroadcaster.Remove(projectId, Context.ConnectionId);
            await Clients.Group(GroupName(projectId)).SendAsync(
                "projectUserLeft",
                userId,
                Context.ConnectionAborted);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public static string GroupName(Guid projectId) => $"project:{projectId:N}";

    private static string ProjectKey(Guid projectId) => $"joined:{projectId:N}";

    private bool IsJoined(Guid projectId) =>
        Context.Items.ContainsKey(ProjectKey(projectId));

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

public sealed record CursorPosition(double X, double Y);
