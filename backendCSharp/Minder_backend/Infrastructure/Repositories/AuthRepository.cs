using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class AuthRepository(ApplicationDbContext dbContext) : IAuthRepository
    {
        public async Task<UserEntity> AddUserAsync(UserEntity user)
        {
            await dbContext.Users.AddAsync(user);
            await dbContext.SaveChangesAsync();
            return user;
        }

        public async Task<bool> ExsistAsync(string email)
        {
            bool isExist = await dbContext.Users.AnyAsync(u => u.Email == email);
            return isExist;
        }

        public void Add(UserEntity user)
        {
            dbContext.Users.Add(user);
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }

        public async Task<UserEntity?> GetUserAsync(string mail)
        {
            return await dbContext.Users
                .Include(u => u.AvatarColor)
                .SingleOrDefaultAsync(u => u.Email == mail);
        }

        public async Task<UserEntity?> GetUserByIdAsync(Guid userId)
        {
            return await dbContext.Users
                .Include(u => u.AvatarColor)
                .SingleOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<UserEntity?> GetUserByVerificationTokenAsync(string token)
        {
            return await dbContext.Users.SingleOrDefaultAsync(u => u.EmailVerificationToken == token);
        }

        public async Task UpdateUserRefreshTokenAsync(Guid userId, string token, DateTime expiry)
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user != null)
            {
                user.RefreshToken = token;
                user.RefreshTokenExpiryTime = expiry;
                await dbContext.SaveChangesAsync();
            }
        }

        public async Task<(string, DateTime)?> GetUserRefreshTokenAsync(Guid userId)
        {
            var user = await dbContext.Users.FindAsync(userId);

            if (user != null && user.RefreshToken != null && user.RefreshTokenExpiryTime != null)
            {
                return (user.RefreshToken, user.RefreshTokenExpiryTime.Value);
            }

            return null;
        }
    }
}
