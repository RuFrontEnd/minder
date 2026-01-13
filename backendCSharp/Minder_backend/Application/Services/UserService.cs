using Application.DTOs;
using Domain.Repositories;

namespace Application.Services;

public class UserService(IUserRepository userRepository)
{
    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await userRepository.GetAllAsync();

        // 將 Domain Entity 轉換為 DTO
        return users.Select(u => new UserDto
        {
            Id = u.Id,
            Email = u.Email
        });
    }
}