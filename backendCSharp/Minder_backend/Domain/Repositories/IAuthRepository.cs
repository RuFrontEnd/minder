using Domain.Entities;

namespace Domain.Repositories
{
    public interface IAuthRepository
    {
        Task<User> AddUserAsync(User user);
        Task<bool> ExsistAsync(string email);
        void Add(User user);
        Task SaveChangesAsync();
        Task<User> GetUserAsync(string mail, string password);
    }

}
