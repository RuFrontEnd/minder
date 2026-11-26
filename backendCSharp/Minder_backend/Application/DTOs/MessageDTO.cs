using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public sealed record CreateMessageRequest
{
    [Required, StringLength(5000, MinimumLength = 1)]
    public required string Content { get; init; }
    [StringLength(5000)]
    public string? Comment { get; init; }
}

public sealed record UpdateMessageRequest
{
    [Required, StringLength(5000, MinimumLength = 1)]
    public required string Content { get; init; }
    [StringLength(5000)]
    public string? Comment { get; init; }
}

public sealed record MessageResponse(
    Guid Id, Guid StepId, Guid MemberId, string Content, string? Comment,
    DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);
