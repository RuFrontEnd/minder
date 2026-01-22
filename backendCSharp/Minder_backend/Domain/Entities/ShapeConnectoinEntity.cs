using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public enum Direciton
    {
        'left' = 1,
        'top' = 2,
        'right' = 3,
        'bottom' = 4
    }
    public class ShapeConnecitonEntity
    {
        public Guid Id { get; private set; }

        // FK
        public Guid SourceId { get; set; }
        [ForeignKey("ShapeId")]
        public ShapeEntity Shape { get; set; } = null!;

        // FK
        public Guid TargetId { get; private set; }
        public ShapeEntity Shape { get; set; } = null!;
    }

}