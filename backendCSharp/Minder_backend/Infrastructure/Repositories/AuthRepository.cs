using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories
{
    public class AuthRepository(ApplicationDbContext context) : IAuthRepository
    {
        public async Task<User> AddUserAsync(User user)
        {
            await context.User.AddAsync(user);
            await context.SaveChangesAsync();
            return user;
        }
    }

}
