namespace Application.DTOs
{
    /// <summary>Project details returned by the API.</summary>
    public sealed record ProjectDTO(Guid Id, Guid UserId, string Name, string Role);

    /// <summary>Request payload for creating a project.</summary>
    public sealed record CreateProjectRequest
    {
        /// <summary>The display name of the project.</summary>
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 1)]
        public required string Name { get; init; }
    }

    /// <summary>Request payload for updating a project.</summary>
    public sealed record UpdateProjectRequest
    {
        /// <summary>The new display name of the project.</summary>
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 1)]
        public required string Name { get; init; }
    }
}