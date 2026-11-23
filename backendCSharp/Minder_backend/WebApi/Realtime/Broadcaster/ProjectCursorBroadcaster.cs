using Microsoft.AspNetCore.SignalR;

namespace WebAPi.Realtime;

public sealed class ProjectCursorBroadcaster(
    IHubContext<ProjectHub> projectHub,
    ILogger<ProjectCursorBroadcaster> logger) : BackgroundService
{
    private readonly object _sync = new();
    private readonly Dictionary<(Guid ProjectId, string ConnectionId), CursorState> _pending = new();
    private readonly HashSet<Task> _broadcasts = new();

    public void Update(Guid projectId, string connectionId, Guid userId, CursorPosition position)
    {
        lock (_sync)
        {
            var key = (projectId, connectionId);
            if (!_pending.TryGetValue(key, out var state))
            {
                state = new CursorState();
                _pending.Add(key, state);
            }

            state.Latest = new PendingCursor(projectId, connectionId, userId, position);
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
                        if (state.IsSending || state.Latest is not { } cursor) continue;

                        state.IsSending = true;
                        state.Latest = null;
                        var broadcast = BroadcastAsync(key, state, cursor, stoppingToken);
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
        CursorState state,
        PendingCursor cursor,
        CancellationToken cancellationToken)
    {
        try
        {
            await projectHub.Clients
                .GroupExcept(ProjectHub.GroupName(cursor.ProjectId), [cursor.ConnectionId])
                .SendAsync(
                    "projectCursorMoved",
                    new { cursor.UserId, cursor.Position },
                    cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to broadcast a cursor position for project {ProjectId}.", cursor.ProjectId);
        }
        finally
        {
            lock (_sync)
            {
                if (_pending.TryGetValue(key, out var current) && ReferenceEquals(current, state))
                {
                    state.IsSending = false;
                    if (state.Latest is null) _pending.Remove(key);
                }
            }
        }
    }

    private sealed class CursorState
    {
        public PendingCursor? Latest { get; set; }
        public bool IsSending { get; set; }
    }

    private sealed record PendingCursor(
        Guid ProjectId,
        string ConnectionId,
        Guid UserId,
        CursorPosition Position);
}
