using Application.DTOs;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Services;

public sealed class TaskService(ITaskRepository repository)
{
    public async Task<IReadOnlyList<TaskResponse>?> GetAsync(Guid stepId, Guid userId, CancellationToken ct) =>
        (await repository.GetByStepAsync(stepId, userId, ct))?.Select(Map).ToList();

    public async Task<TaskResponse?> GetAsync(Guid stepId, Guid id, Guid userId, CancellationToken ct) =>
        MapNullable(await repository.GetAsync(stepId, id, userId, ct));

    public async Task<TaskResponse?> CreateAsync(Guid stepId, Guid userId, CreateTaskRequest request, CancellationToken ct) =>
        MapNullable(await repository.AddAsync(new TaskEntity(stepId, request.OwnerId, request.Title.Trim(),
            request.Description.Trim(), request.Completed), userId, ct));

    public async Task<TaskResponse?> UpdateAsync(Guid stepId, Guid id, Guid userId, UpdateTaskRequest request, CancellationToken ct)
    {
        var existing = await repository.GetAsync(stepId, id, userId, ct);
        if (existing is null) return null;
        existing.Update(request.Title.Trim(), request.Description.Trim(), request.Completed, request.OwnerId);
        return MapNullable(await repository.UpdateAsync(existing, userId, ct));
    }

    public Task<bool> DeleteAsync(Guid stepId, Guid id, Guid userId, CancellationToken ct) =>
        repository.DeleteAsync(stepId, id, userId, ct);

    private static TaskResponse Map(TaskEntity task) =>
        new(task.Id, task.StepId, task.Title, task.Description, task.Completed, task.Owner);
    private static TaskResponse? MapNullable(TaskEntity? task) => task is null ? null : Map(task);
}
