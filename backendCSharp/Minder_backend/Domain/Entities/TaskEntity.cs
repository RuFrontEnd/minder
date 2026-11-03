namespace Domain.Entities
{
    public class TaskEntity
    {
        public Guid Id { get; private set; }
        public Guid StepId { get; private set; }
        public Guid Owner { get; private set; }
        public string Description { get; private set; }

        public TaskEntity(Guid stepId, Guid owner, string description)
        {
            StepId = stepId;
            Owner = owner;
            Description = description;
        }
    }
}
