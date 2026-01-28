using Domain.Entities;

namespace Domain.Repositories
{
    public interface IAuthRepository
    {
        Task<UserEntity> AddUserAsync(UserEntity user);
        Task<bool> ExsistAsync(string email);
        void Add(UserEntity user);
        Task SaveChangesAsync();
        Task<UserEntity> GetUserAsync(string mail, string password);
        Task UpdateUserRefreshTokenAsync(Guid userId, string refreshToken, DateTime expiry);
        Task<(string, DateTime)?> GetUserRefreshTokenAsync(Guid userId);
    }

}
