using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class UserRepository(ApplicationDbContext context) : IUserRepository
    {
        public async Task<IEnumerable<UserEntity>> GetAllAsync()
        {
            return await context.User.ToListAsync();
        }
    }

}
