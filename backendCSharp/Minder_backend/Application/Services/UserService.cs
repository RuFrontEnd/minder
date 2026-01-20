using Application.DTOs;
using Domain.Repositories;
using Infrastructure.Persistence;

namespace Application.Services;

public class UserService(ApplicationDbContext context, IUserRepository userRepository)
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
};