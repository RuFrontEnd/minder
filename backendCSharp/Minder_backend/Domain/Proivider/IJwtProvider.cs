using Domain.Entities;

namespace Domain.Provider
{
    public interface IJwtProvider
    {
        (string Token, DateTime Expiration) GetJwtToken(Guid userId, string email);
    }
}
