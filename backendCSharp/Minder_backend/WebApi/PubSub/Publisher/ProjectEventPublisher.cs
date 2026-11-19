using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;
using WebAPi.Realtime;

namespace WebAPi.PubSub;

public interface IProjectEventPublisher
{
    Task PublishAsync(ProjectUpdatedEvent projectEvent);
}

internal static class ProjectEventJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };
}

// Implementation of IProjectEventPublisher that publishes project events to Redis.
public sealed class ProjectEventPublisher(IConnectionMultiplexer redis) : IProjectEventPublisher
{
    public Task PublishAsync(ProjectUpdatedEvent projectEvent)
    {
        var channel = ProjectEventChannel.For(projectEvent.ProjectId);
        var message = JsonSerializer.Serialize(
            projectEvent,
            ProjectEventJson.Options);

        return redis.GetSubscriber().PublishAsync(
            RedisChannel.Literal(channel),
            message);
    }
}

// Local implementation of IProjectEventPublisher using SignalR Hub for real-time updates.
public sealed class LocalProjectEventPublisher(
    IHubContext<ProjectHub> projectHub) : IProjectEventPublisher
{
    public Task PublishAsync(ProjectUpdatedEvent projectEvent)
    {
        return projectHub.Clients
            .Group(ProjectHub.GroupName(projectEvent.ProjectId))
            .SendAsync("projectUpdated", projectEvent);
    }
}

public static class ProjectEventChannel
{
    public static string For(Guid projectId) =>
        $"project:{projectId:N}:events";

    public static readonly RedisChannel Pattern =
        RedisChannel.Pattern("project:*:events");
}
