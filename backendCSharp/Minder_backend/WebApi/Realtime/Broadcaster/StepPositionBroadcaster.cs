using Microsoft.AspNetCore.SignalR;

namespace WebAPi.Realtime;

public sealed class StepPositionBroadcaster(
    IHubContext<ProjectHub> projectHub,
    ILogger<StepPositionBroadcaster> logger) : BackgroundService
{
    private readonly object _sync = new();
    private readonly Dictionary<(Guid ProjectId, string ConnectionId), PositionState> _pending = new();
    private readonly HashSet<Task> _broadcasts = new();

    public void Update(
        Guid projectId,
        string connectionId,
        Guid userId,
        Guid stepId,
        StepPosition position)
    {
        lock (_sync)
        {
            var key = (projectId, connectionId);
            if (!_pending.TryGetValue(key, out var state))
            {
                state = new PositionState();
                _pending.Add(key, state);
            }

            state.Latest = new PendingPosition(
                projectId,
                connectionId,
                userId,
                stepId,
                position);
        }
    }

    public void Remove(Guid projectId, string connectionId)
    {
        lock (_sync)
        {
            _pending.Remove((projectId, connectionId));
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(33));
        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                lock (_sync)
                {
                    foreach (var (key, state) in _pending.ToArray())
                    {
                        if (state.IsSending || state.Latest is not { } position) continue;

                        state.IsSending = true;
                        state.Latest = null;
                        var broadcast = BroadcastAsync(key, state, position, stoppingToken);
                        _broadcasts.Add(broadcast);
                        _ = broadcast.ContinueWith(
                            completed =>
                            {
                                lock (_sync)
                                {
                                    _broadcasts.Remove(completed);
                                }
                            },
                            CancellationToken.None,
                            TaskContinuationOptions.ExecuteSynchronously,
                            TaskScheduler.Default);
                    }
                }
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        finally
        {
            Task[] broadcasts;
            lock (_sync)
            {
                broadcasts = _broadcasts.ToArray();
            }
            await Task.WhenAll(broadcasts);
        }
    }

    private async Task BroadcastAsync(
        (Guid ProjectId, string ConnectionId) key,
        PositionState state,
        PendingPosition position,
        CancellationToken cancellationToken)
    {
        try
        {
            await projectHub.Clients
                .GroupExcept(ProjectHub.GroupName(position.ProjectId), [position.ConnectionId])
                .SendAsync(
                    "stepPositionPreview",
                    new
                    {
                        position.UserId,
                        position.StepId,
                        position.Position
                    },
                    cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Failed to broadcast a step position preview for project {ProjectId}.",
                position.ProjectId);
        }
        finally
        {
            lock (_sync)
            {
                if (_pending.TryGetValue(key, out var current) &&
                    ReferenceEquals(current, state))
                {
                    state.IsSending = false;
                    if (state.Latest is null) _pending.Remove(key);
                }
            }
        }
    }

    private sealed class PositionState
    {
        public PendingPosition? Latest { get; set; }
        public bool IsSending { get; set; }
    }

    private sealed record PendingPosition(
        Guid ProjectId,
        string ConnectionId,
        Guid UserId,
        Guid StepId,
        StepPosition Position);
}
