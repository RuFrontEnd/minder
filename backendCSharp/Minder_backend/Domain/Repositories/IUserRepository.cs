using Domain.Entities;

namespace Domain.Repositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<UserEntity>> GetAllAsync();
        Task<IEnumerable<UserEntity>> SearchAsync(
            string query,
            CancellationToken cancellationToken);
    }

}
