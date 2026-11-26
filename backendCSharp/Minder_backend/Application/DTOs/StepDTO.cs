using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

/// <summary>Payload for creating a step in a project.</summary>
public sealed record CreateStepRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public required string Title { get; init; }

    [StringLength(5000)]
    public string Description { get; init; } = string.Empty;

    [StringLength(5000)]
    public string Ac { get; init; } = string.Empty;

    [Range(1, 10000)]
    public double Width { get; init; }

    [Range(1, 10000)]
    public double Height { get; init; }

    public double X { get; init; }

    public double Y { get; init; }
}

/// <summary>Payload for updating a step's canvas position.</summary>
public sealed record UpdateStepPositionRequest
{
    public double X { get; init; }

    public double Y { get; init; }
}

/// <summary>Payload for partially updating a step.</summary>
public sealed record UpdateStepDetailsRequest
{
    [StringLength(200, MinimumLength = 1)]
    public string? Title { get; init; }

    [StringLength(5000)]
    public string? Description { get; init; }

    [StringLength(5000)]
    public string? Ac { get; init; }

    public Guid? StatusId { get; init; }

    public Guid? OwnerId { get; init; }
}

/// <summary>Represents a dependency where a step requires another step.</summary>
public sealed record StepDependencyResponse(Guid StepId, Guid DependsOnStepId);

/// <summary>Payload for creating a dependency with its canvas connection directions.</summary>
public sealed record CreateStepDependencyRequest
{
    [RegularExpression("^[ltrb]$")]
    public string? SourceDirection { get; init; }

    [RegularExpression("^[ltrb]$")]
    public string? TargetDirection { get; init; }
}

/// <summary>Represents a step returned by the API.</summary>
public sealed record StepResponse(
    Guid Id,
    Guid ProjectId,
    Guid CreatorId,
    Guid OwnerId,
    string Title,
    string Description,
    string Ac,
    double Width,
    double Height,
    double X,
    double Y,
    string Status);