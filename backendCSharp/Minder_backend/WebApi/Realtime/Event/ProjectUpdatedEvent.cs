namespace WebAPi.Realtime;

public sealed record ProjectUpdatedEvent(
    string EventType,
    Guid ProjectId,
    object Data,
    Guid UpdatedBy,
    DateTimeOffset OccurredAt);

