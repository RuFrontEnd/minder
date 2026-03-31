using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class ProjectEntity
    {
        public ProjectEntity(Guid id, Guid userId)
        {
            Id = id;
            UserId = userId;
        }
        public Guid Id { get; private set; }

        // FK
        public Guid UserId { get; set; }
    }
}