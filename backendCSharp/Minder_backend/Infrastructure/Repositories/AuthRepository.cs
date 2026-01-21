using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class AuthRepository(ApplicationDbContext dbContext) : IAuthRepository
    {
        public async Task<User> AddUserAsync(User user)
        {
            await dbContext.User.AddAsync(user);
            await dbContext.SaveChangesAsync();
            return user;
        }

        public async Task<bool> ExsistAsync(string email)
        {
            bool isExist = await dbContext.User.AnyAsync(u => u.Email == email);
            return isExist;
        }

        public void Add(User user)
        {
            dbContext.User.Add(user);
        }
        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }

        public async Task<User> GetUserAsync(string mail, string password)
        {
            var user = await dbContext.User.SingleOrDefaultAsync(u => u.Email == mail);
            return user;
        }
    }

}
