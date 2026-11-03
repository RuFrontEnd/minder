namespace Domain.Entities
{
    public class MessageEntity
    {
        public Guid Id { get; private set; }
        public Guid StepId { get; private set; }
        public Guid MemberId { get; private set; }
        public string Content { get; private set; } = null!;
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public MessageEntity(Guid stepId, Guid memberId, string content)
        {
            StepId = stepId;
            MemberId = memberId;
            Content = content;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }
    }
}
