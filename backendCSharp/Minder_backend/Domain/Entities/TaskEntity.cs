namespace Domain.Entities
{
    public class TaskEntity
    {
        public Guid Id { get; private set; }
        public Guid StepId { get; private set; }
        public Guid Owner { get; private set; }
        public string Title { get; private set; }
        public string Description { get; private set; }
        public bool Completed { get; private set; }

        public TaskEntity(Guid stepId, Guid owner, string title, string description, bool completed = false)
        {
            StepId = stepId;
            Owner = owner;
            Title = title;
            Description = description;
            Completed = completed;
        }

        public void Update(string title, string description, bool completed, Guid owner)
        {
            Title = title;
            Description = description;
            Completed = completed;
            Owner = owner;
        }
    }
}
