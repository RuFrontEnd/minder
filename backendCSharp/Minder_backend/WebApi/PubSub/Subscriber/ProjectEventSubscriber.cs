using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;
using WebAPi.Realtime;

namespace WebAPi.PubSub;

public sealed class ProjectEventSubscriber(
    IConnectionMultiplexer redis,
    IHubContext<ProjectHub> projectHub,
    ILogger<ProjectEventSubscriber> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        var subscriber = redis.GetSubscriber();

        subscriber.Subscribe(
            ProjectEventChannel.Pattern,
            (_channel, value) => _ = ForwardEventAsync(value));

        try
        {
            await Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        finally
        {
            await subscriber.UnsubscribeAsync(ProjectEventChannel.Pattern);
        }
    }

    // judge if the Redis project event is valid and forward it to SignalR clients.
    private async Task ForwardEventAsync(RedisValue value)
    {
        try
        {
            var projectEvent = JsonSerializer.Deserialize<ProjectUpdatedEvent>(
                value.ToString(),
                ProjectEventJson.Options);

            if (projectEvent is null)
            {
                logger.LogWarning("Ignored an empty Redis project event.");
                return;
            }

            await projectHub.Clients
                .Group(ProjectHub.GroupName(projectEvent.ProjectId))
                .SendAsync("projectUpdated", projectEvent);
        }
        catch (JsonException exception)
        {
            logger.LogError(exception, "Failed to deserialize a Redis project event.");
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to forward a Redis project event.");
        }
    }
}
