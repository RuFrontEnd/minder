using Application.DTOs;

namespace Application.Services;

public interface IShapeService
{
    Task<IReadOnlyList<StepResponse>?> GetStepsAsync(
        Guid projectId,
        Guid userId,
        CancellationToken cancellationToken);

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

    Task<StepResponse?> UpdateStepPositionAsync(
        Guid projectId,
        Guid stepId,
        Guid userId,
        UpdateStepPositionRequest request,
        CancellationToken cancellationToken);
}