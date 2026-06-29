using Domain.Entities;

namespace Domain.Repositories
{
    public interface IMemberRepository
    {
        Task<IEnumerable<MemberEntity>> GetMembersAsync(Guid projectId);
        Task<IEnumerable<MemberEntity>> InsertMembersAsync(Guid projectId, Guid userId);
        Task<IEnumerable<MemberEntity>> RemoveMemberAsync(Guid projectId, Guid userId);
    }

}
