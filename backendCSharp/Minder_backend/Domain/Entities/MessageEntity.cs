namespace Domain.Entities
{
    public class MessageEntity
    {
        public Guid Id { get; private set; }
        public Guid StepId { get; private set; }
        public Guid MemberId { get; private set; }
        public string Content { get; private set; } = null!;
        public string? Comment { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public MessageEntity(Guid stepId, Guid memberId, string content, string? comment = null)
        {
            StepId = stepId;
            MemberId = memberId;
            Content = content;
            Comment = comment;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void Update(string content, string? comment)
        {
            Content = content;
            Comment = comment;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
