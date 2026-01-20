using Domain.Entities;

namespace Domain.Repositories
{
    public interface IAuthRepository
    {
        Task<User> AddUserAsync(User user);
    }

}
