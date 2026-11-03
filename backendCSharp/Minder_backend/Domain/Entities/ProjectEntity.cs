using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class ProjectEntity
    {
        public ProjectEntity(Guid id, Guid userId, string name)
        {
            Id = id;
            UserId = userId;
            Name = name;
        }
        public Guid Id { get; private set; }

        // FK
        public Guid UserId { get; set; }
        public string Name { get; private set; }

        public void Rename(string name)
        {
            Name = name;
        }
    }
}