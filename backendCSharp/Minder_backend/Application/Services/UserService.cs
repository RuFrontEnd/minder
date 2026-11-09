using Application.DTOs;
using Domain.Provider;
using Domain.Repositories;
using Infrastructure.Persistence;

namespace Application.Services;

public class UserService(
    ApplicationDbContext context,
    IUserRepository userRepository,
    IAvatarStorageProvider avatarStorageProvider)
{
    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await userRepository.GetAllAsync();

        // 將 Domain Entity 轉換為 DTO
        return users.Select(user => new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Password = user.Password
        });
    }

    public async Task<IEnumerable<UserSearchDto>> SearchUsersAsync(
        string query,
        CancellationToken cancellationToken)
    {
        var users = await userRepository.SearchAsync(query, cancellationToken);

        return await Task.WhenAll(users.Select(async user => new UserSearchDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            await avatarStorageProvider.CreateDownloadUrlAsync(user.AvatarUrl),
            user.AvatarColor is null
                ? null
                : new AvatarColorDto
                {
                    Name = user.AvatarColor.Name,
                    Color = user.AvatarColor.Color,
                    BackgroundColor = user.AvatarColor.BackgroundColor
                })));
    }
}