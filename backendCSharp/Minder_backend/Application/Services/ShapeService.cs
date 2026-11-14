using Application.DTOs;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Services;

public sealed class ShapeService(
    IProjectRepository projectRepository,
    IShapeRepository shapeRepository) : IShapeService
{
    public async Task<IReadOnlyList<StepResponse>?> GetStepsAsync(
        Guid projectId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var membership = await projectRepository.GetProjectAsync(
            projectId,
            userId,
            cancellationToken);
        if (membership is null) return null;

        var steps = await shapeRepository.GetStepsAsync(projectId, cancellationToken);
        return steps.Select(ToResponse).ToArray();
    }

    public async Task<StepResponse?> GetStepAsync(
        Guid projectId,
        Guid stepId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var membership = await projectRepository.GetProjectAsync(
            projectId,
            userId,
            cancellationToken);
        if (membership is null) return null;

        var step = await shapeRepository.GetStepAsync(
            projectId,
            stepId,
            cancellationToken);
        return step is null ? null : ToResponse(step);
    }

    public async Task<StepResponse?> CreateStepAsync(
        Guid projectId,
        Guid userId,
        CreateStepRequest request,
        CancellationToken cancellationToken)
    {
        var membership = await projectRepository.GetProjectAsync(
            projectId,
            userId,
            cancellationToken);

        if (membership is null ||
            (!string.Equals(membership.Role, "owner", StringComparison.OrdinalIgnoreCase) &&
             !string.Equals(membership.Role, "member", StringComparison.OrdinalIgnoreCase)))
        {
            return null;
        }

        var step = new StepEntity(Guid.NewGuid(), projectId)
        {
            Creator = userId,
            Owner = userId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            W = request.Width,
            H = request.Height,
            X = request.X,
            Y = request.Y,
            Status = "todo"
        };

        var createdStep = await shapeRepository.AddShapeAsync(step, cancellationToken);
        return ToResponse(createdStep);
    }

    public async Task<StepResponse?> UpdateStepPositionAsync(
        Guid projectId,
        Guid stepId,
        Guid userId,
        UpdateStepPositionRequest request,
        CancellationToken cancellationToken)
    {
        var membership = await projectRepository.GetProjectAsync(
            projectId,
            userId,
            cancellationToken);

        if (membership is null ||
            (!string.Equals(membership.Role, "owner", StringComparison.OrdinalIgnoreCase) &&
             !string.Equals(membership.Role, "member", StringComparison.OrdinalIgnoreCase)))
        {
            return null;
        }

        var step = await shapeRepository.GetStepAsync(
            projectId,
            stepId,
            cancellationToken);
        if (step is null) return null;

        step.X = request.X;
        step.Y = request.Y;

        var updatedStep = await shapeRepository.UpdateShapeAsync(step);
        return ToResponse(updatedStep);
    }

    private static StepResponse ToResponse(StepEntity step) => new(
        step.Id,
        step.ProjectId,
        step.Creator,
        step.Owner,
        step.Title,
        step.Description,
        step.W,
        step.H,
        step.X,
        step.Y,
        step.Status);
}