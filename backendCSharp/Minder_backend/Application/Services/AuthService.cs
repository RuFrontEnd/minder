using Application.DTOs;
using Domain.Entities;
using Domain.Repositories;
using Domain.Provider;
using Infrastructure.Persistence;
using Infrastructure.Provider;

namespace Application.Services;

public class AuthService(ApplicationDbContext dbContext, IAuthRepository authRepository, IJwtProvider jwtProvider)
{
    public async Task<UserDto> RegisterUserAsync(string email, string password)
    {
        // 1. 檢查 Email 是否已被註冊 (Business Rule)
        var exists = await authRepository.ExsistAsync(email);
        if (exists)
        {
            throw new Exception("Email has been registered.");
        }

        // 2. 密碼加密 (重要！實務上不可存明文)
        // 這裡假設你有一個 PasswordHasher 工具，或是簡單示範
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        // 3. 建立 Domain Entity
        // 這裡會呼叫你之前寫的那個有 Guid.NewGuid() 的建構函式
        var user = new UserEntity(email, hashedPassword);

        // 4. 存入資料庫
        authRepository.Add(user);
        await authRepository.SaveChangesAsync();

        // 5. 將 Entity 轉回 DTO 回傳給 Controller
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email
        };
    }

    public async Task<LoginResponse?> LoginAsync(string email, string password)
    {
        // 1. check if user exsists
        var user = await authRepository.GetUserAsync(email, password);

        if (user == null)
        {
            return null;
        }

        // 2. verify input password with db password
        if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
        {
            return null;
        }

        // 3. generate 
        var (token, expiration) = jwtProvider.GetJwtToken(user);

        return new LoginResponse
        {
            Token = token,
            Expiration = expiration,
            User = new LoginResponse.UserInfo
            {
                Id = user.Id,
                Email = user.Email,
            },
        };
    }
}