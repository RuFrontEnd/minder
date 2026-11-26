using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public sealed record CreateTaskRequest
{
    [Required, StringLength(200, MinimumLength = 1)]
    public required string Title { get; init; }
    [StringLength(5000)]
    public string Description { get; init; } = string.Empty;
    public bool Completed { get; init; }
    public Guid OwnerId { get; init; }
}

public sealed record UpdateTaskRequest
{
    [Required, StringLength(200, MinimumLength = 1)]
    public required string Title { get; init; }
    [StringLength(5000)]
    public string Description { get; init; } = string.Empty;
    public bool Completed { get; init; }
    public Guid OwnerId { get; init; }
}

public sealed record TaskResponse(
    Guid Id, Guid StepId, string Title, string Description, bool Completed, Guid OwnerId);
