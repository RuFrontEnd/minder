namespace Domain.Entities
{
    public class MemberEntity
    {
        public MemberEntity(Guid userId, Guid projectId)
            : this(userId, projectId, RoleEntity.OwnerId)
        {
        }

        public MemberEntity(Guid userId, Guid projectId, Guid roleId)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            ProjectId = projectId;
            RoleId = roleId;
        }
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid ProjectId { get; private set; }
        public Guid RoleId { get; private set; }
    }

}