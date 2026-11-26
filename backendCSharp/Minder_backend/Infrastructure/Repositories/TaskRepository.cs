using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TaskRepository(ApplicationDbContext context) : ITaskRepository
{
    private IQueryable<TaskEntity> Accessible(Guid stepId, Guid userId) =>
        context.Tasks.Where(task => task.StepId == stepId &&
            context.Members.Any(member => member.UserId == userId &&
                context.Steps.Any(step => step.Id == task.StepId && step.ProjectId == member.ProjectId)));

    public async Task<List<TaskEntity>?> GetByStepAsync(Guid stepId, Guid userId, CancellationToken ct)
    {
        if (!await HasAccess(stepId, userId, ct)) return null;
        return await context.Tasks.Where(t => t.StepId == stepId).OrderBy(t => t.Id).ToListAsync(ct);
    }

    public Task<TaskEntity?> GetAsync(Guid stepId, Guid taskId, Guid userId, CancellationToken ct) =>
        Accessible(stepId, userId).FirstOrDefaultAsync(t => t.Id == taskId, ct);

    public async Task<TaskEntity?> AddAsync(TaskEntity task, Guid userId, CancellationToken ct)
    {
        if (!await HasAccess(task.StepId, userId, ct) ||
            !await context.Users.AnyAsync(u => u.Id == task.Owner, ct)) return null;
        await context.Tasks.AddAsync(task, ct);
        await context.SaveChangesAsync(ct);
        return task;
    }

    public async Task<TaskEntity?> UpdateAsync(TaskEntity task, Guid userId, CancellationToken ct)
    {
        var existing = await GetAsync(task.StepId, task.Id, userId, ct);
        if (existing is null || !await context.Users.AnyAsync(u => u.Id == task.Owner, ct)) return null;
        existing.Update(task.Title, task.Description, task.Completed, task.Owner);
        await context.SaveChangesAsync(ct);
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid stepId, Guid taskId, Guid userId, CancellationToken ct)
    {
        var task = await GetAsync(stepId, taskId, userId, ct);
        if (task is null) return false;
        context.Tasks.Remove(task);
        await context.SaveChangesAsync(ct);
        return true;
    }

    private Task<bool> HasAccess(Guid stepId, Guid userId, CancellationToken ct) =>
        context.Members.AnyAsync(member => member.UserId == userId &&
            context.Steps.Any(step => step.Id == stepId && step.ProjectId == member.ProjectId), ct);
}
