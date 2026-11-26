using Domain.Entities;

namespace Domain.Repositories;

public interface ITaskRepository
{
    Task<List<TaskEntity>?> GetByStepAsync(Guid stepId, Guid userId, CancellationToken cancellationToken);
    Task<TaskEntity?> GetAsync(Guid stepId, Guid taskId, Guid userId, CancellationToken cancellationToken);
    Task<TaskEntity?> AddAsync(TaskEntity task, Guid userId, CancellationToken cancellationToken);
    Task<TaskEntity?> UpdateAsync(TaskEntity task, Guid userId, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid stepId, Guid taskId, Guid userId, CancellationToken cancellationToken);
}
