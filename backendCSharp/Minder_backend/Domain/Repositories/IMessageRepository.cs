using Domain.Entities;

namespace Domain.Repositories;

public interface IMessageRepository
{
    Task<List<MessageEntity>?> GetByStepAsync(Guid stepId, Guid userId, CancellationToken cancellationToken);
    Task<MessageEntity?> GetAsync(Guid stepId, Guid messageId, Guid userId, CancellationToken cancellationToken);
    Task<Guid?> GetMemberIdAsync(Guid stepId, Guid userId, CancellationToken cancellationToken);
    Task<MessageEntity?> AddAsync(MessageEntity message, Guid userId, CancellationToken cancellationToken);
    Task<MessageEntity?> UpdateAsync(MessageEntity message, Guid userId, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid stepId, Guid messageId, Guid userId, CancellationToken cancellationToken);
}
