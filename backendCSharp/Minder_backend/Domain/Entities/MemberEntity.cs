namespace Domain.Entities
{
    public class MemberEntity
    {
        public MemberEntity(Guid userId, Guid projectId)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            ProjectId = projectId;
        }
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid ProjectId { get; private set; }
    }

}