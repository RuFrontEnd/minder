using Application.DTOs;

namespace Application.Services;

public interface IShapeService
{
    Task<StepResponse?> GetStepAsync(
        Guid projectId,
        Guid stepId,
        Guid userId,
        CancellationToken cancellationToken);

    Task<StepResponse?> CreateStepAsync(
        Guid projectId,
        Guid userId,
        CreateStepRequest request,
        CancellationToken cancellationToken);
}