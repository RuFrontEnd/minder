using Application.DTOs;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Services;

public sealed class MessageService(IMessageRepository repository)
{
    public async Task<IReadOnlyList<MessageResponse>?> GetAsync(Guid stepId, Guid userId, CancellationToken ct) =>
        (await repository.GetByStepAsync(stepId, userId, ct))?.Select(Map).ToList();

    public async Task<MessageResponse?> GetAsync(Guid stepId, Guid id, Guid userId, CancellationToken ct) =>
        MapNullable(await repository.GetAsync(stepId, id, userId, ct));

    public async Task<MessageResponse?> CreateAsync(Guid stepId, Guid userId, CreateMessageRequest request, CancellationToken ct)
    {
        var memberId = await repository.GetMemberIdAsync(stepId, userId, ct);
        return memberId is null ? null : MapNullable(await repository.AddAsync(
            new MessageEntity(stepId, memberId.Value, request.Content.Trim(), request.Comment?.Trim()),
            userId, ct));
    }

    public async Task<MessageResponse?> UpdateAsync(Guid stepId, Guid id, Guid userId, UpdateMessageRequest request, CancellationToken ct)
    {
        var existing = await repository.GetAsync(stepId, id, userId, ct);
        if (existing is null) return null;
        existing.Update(request.Content.Trim(), request.Comment?.Trim());
        return MapNullable(await repository.UpdateAsync(existing, userId, ct));
    }

    public Task<bool> DeleteAsync(Guid stepId, Guid id, Guid userId, CancellationToken ct) =>
        repository.DeleteAsync(stepId, id, userId, ct);

    private static MessageResponse Map(MessageEntity message) => new(
        message.Id, message.StepId, message.MemberId, message.Content, message.Comment,
        new DateTimeOffset(DateTime.SpecifyKind(message.CreatedAt, DateTimeKind.Utc)),
        new DateTimeOffset(DateTime.SpecifyKind(message.UpdatedAt, DateTimeKind.Utc)));
    private static MessageResponse? MapNullable(MessageEntity? message) => message is null ? null : Map(message);
}
