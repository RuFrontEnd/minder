namespace Application.DTOs;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public AvatarColorDto? AvatarColor { get; set; }
}

public sealed record UpdateAvatarRequest(string? AvatarUrl);

public class AvatarColorDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string BackgroundColor { get; set; } = string.Empty;
}
