using Domain.Entities;

namespace Domain.Repositories
{
    public interface IShapeRepository
    {
        Task<Guid?> ExsistAsync(Guid userId);
        Task<StepEntity?> GetStepAsync(
            Guid projectId,
            Guid stepId,
            CancellationToken cancellationToken);
        Task<List<StepEntity>> GetStepsAsync(
            Guid projectId,
            CancellationToken cancellationToken);
        // Return the StepEntity for the given user. Infos/Curves were removed from the entity,
        // so repository returns the entity itself.
        Task<StepEntity?> GetShapeAsync(Guid userId);
        Task<StepEntity> AddShapeAsync(
            StepEntity shape,
            CancellationToken cancellationToken);
        Task<StepEntity> UpdateShapeAsync(StepEntity shape);
    }
}
