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
            return await context.Users.ToListAsync();
        }

        public async Task<IEnumerable<UserEntity>> SearchAsync(
            string query,
            CancellationToken cancellationToken)
        {
            var normalizedQuery = query.Trim().ToLower();

            return await context.Users
                .Include(user => user.AvatarColor)
                .Where(user =>
                    user.Email.ToLower().Contains(normalizedQuery) ||
                    user.FirstName.ToLower().Contains(normalizedQuery) ||
                    user.LastName.ToLower().Contains(normalizedQuery))
                .OrderBy(user => user.Email)
                .Take(20)
                .ToListAsync(cancellationToken);
        }
    }

}
