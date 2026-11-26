using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class MessageRepository(ApplicationDbContext context) : IMessageRepository
{
    private IQueryable<MessageEntity> Accessible(Guid stepId, Guid userId) =>
        context.Messages.Where(message => message.StepId == stepId &&
            context.Members.Any(member => member.UserId == userId &&
                context.Steps.Any(step => step.Id == message.StepId && step.ProjectId == member.ProjectId)));

    public async Task<List<MessageEntity>?> GetByStepAsync(Guid stepId, Guid userId, CancellationToken ct)
    {
        if (!await HasAccess(stepId, userId, ct)) return null;
        return await context.Messages.Where(m => m.StepId == stepId)
            .OrderByDescending(m => m.CreatedAt).ToListAsync(ct);
    }

    public Task<MessageEntity?> GetAsync(Guid stepId, Guid messageId, Guid userId, CancellationToken ct) =>
        Accessible(stepId, userId).FirstOrDefaultAsync(m => m.Id == messageId, ct);

    public async Task<Guid?> GetMemberIdAsync(Guid stepId, Guid userId, CancellationToken ct)
    {
        return await (from member in context.Members
                      join step in context.Steps on member.ProjectId equals step.ProjectId
                      where step.Id == stepId && member.UserId == userId
                      select (Guid?)member.Id).FirstOrDefaultAsync(ct);
    }

    public async Task<MessageEntity?> AddAsync(MessageEntity message, Guid userId, CancellationToken ct)
    {
        if (!await HasAccess(message.StepId, userId, ct)) return null;
        if (message.MemberId == Guid.Empty) return null;
        await context.Messages.AddAsync(message, ct);
        await context.SaveChangesAsync(ct);
        return message;
    }

    public async Task<MessageEntity?> UpdateAsync(MessageEntity message, Guid userId, CancellationToken ct)
    {
        var existing = await GetAsync(message.StepId, message.Id, userId, ct);
        if (existing is null) return null;
        existing.Update(message.Content, message.Comment);
        await context.SaveChangesAsync(ct);
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid stepId, Guid messageId, Guid userId, CancellationToken ct)
    {
        var message = await GetAsync(stepId, messageId, userId, ct);
        if (message is null) return false;
        context.Messages.Remove(message);
        await context.SaveChangesAsync(ct);
        return true;
    }

    private Task<bool> HasAccess(Guid stepId, Guid userId, CancellationToken ct) =>
        context.Members.AnyAsync(member => member.UserId == userId &&
            context.Steps.Any(step => step.Id == stepId && step.ProjectId == member.ProjectId), ct);
}
