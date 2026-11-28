namespace WebAPi.Realtime;

public sealed class ProjectPresenceTracker
{
    private readonly object sync = new();
    private readonly Dictionary<Guid, Dictionary<Guid, HashSet<string>>> connections = new();

    public bool Add(Guid projectId, Guid userId, string connectionId)
    {
        lock (sync)
        {
            if (!connections.TryGetValue(projectId, out var users))
            {
                users = new Dictionary<Guid, HashSet<string>>();
                connections[projectId] = users;
            }

            if (!users.TryGetValue(userId, out var userConnections))
            {
                userConnections = new HashSet<string>();
                users[userId] = userConnections;
            }

            return userConnections.Add(connectionId) && userConnections.Count == 1;
        }
    }

    public bool Remove(Guid projectId, Guid userId, string connectionId)
    {
        lock (sync)
        {
            if (!connections.TryGetValue(projectId, out var users) ||
                !users.TryGetValue(userId, out var userConnections))
            {
                return false;
            }

            userConnections.Remove(connectionId);
            if (userConnections.Count > 0) return false;

            users.Remove(userId);
            if (users.Count == 0) connections.Remove(projectId);
            return true;
        }
    }

    public IReadOnlyCollection<Guid> GetOnlineUsers(Guid projectId)
    {
        lock (sync)
        {
            return connections.TryGetValue(projectId, out var users)
                ? users.Keys.ToArray()
                : Array.Empty<Guid>();
        }
    }
}
