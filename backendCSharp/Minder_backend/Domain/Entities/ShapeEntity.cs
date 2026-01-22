using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public enum ShapeType
    {
        Terminal = 1,
        Process = 2,
        Data = 3,
        Decision = 4
    }
    public class ShapeEntity
    {
        public Guid Id { get; private set; }

        // FK
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public UserEntity User { get; set; } = null!;

        public ShapeType Type { get; private set; }
        public int Px { get; private set; }
        public int Py { get; private set; }
    }

}