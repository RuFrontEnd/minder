using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class ShapeEntity
    {
        public Guid Id { get; private set; }

        // FK
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public UserEntity User { get; set; } = null!;
        public class P
        {
            public int x { get; set; }
            public int y { get; set; }
        }
        public class Data
        {
            public string Id { get; set; } = string.Empty;
            public string Text { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
        }
        public class Info
        {
            public string id { get; set; } = string.Empty;
            public string title { get; set; } = string.Empty;
            public int w { get; set; }
            public int h { get; set; }
            public P p { get; set; } = new();
            public string c { get; set; } = null!;
            public List<Data> importDatas { get; set; } = new();
            public List<Data> usingDatas { get; set; } = new();
            public List<Data> deleteDatas { get; set; } = new();
            public string status { get; set; } = string.Empty;
            public string type { get; set; } = string.Empty;
        }
        public List<Info> Infos { get; set; } = new();
    }

}