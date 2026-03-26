using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class ShapeEntity
    {
        public ShapeEntity(Guid id, Guid userId, List<Info> infos)
        {
            // 注意：這裡使用小寫 id 作為參數名，避免跟屬性 Id 混淆
            Id = id;
            UserId = userId;
            Infos = infos;
        }
        public Guid Id { get; private set; }

        // FK
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public UserEntity User { get; set; } = null!;
        
        public class P
        {
            public decimal x { get; set; }
            public decimal y { get; set; }
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
            public decimal w { get; set; }
            public decimal h { get; set; }
            public P p { get; set; } = new();
            public List<Data> importDatas { get; set; } = new();
            public List<Data> usingDatas { get; set; } = new();
            public List<Data> deleteDatas { get; set; } = new();
            public string status { get; set; } = string.Empty;
            public string type { get; set; } = string.Empty;
        }
        
        public class CurvePoint
        {
            public decimal x { get; set; }
            public decimal y { get; set; }
        }
        
        public class CurveShape
        {
            public string id { get; set; } = string.Empty;
            public CurvePoint p1 { get; set; } = new();
            public CurvePoint cp1 { get; set; } = new();
            public CurvePoint cp2 { get; set; } = new();
            public CurvePoint p2 { get; set; } = new();
            public string text { get; set; } = string.Empty;
        }
        
        public class CurveEnd
        {
            public string d { get; set; } = string.Empty;
            public string shapeId { get; set; } = string.Empty;
        }
        
        public class Curve
        {
            public CurveEnd from { get; set; } = new();
            public CurveShape shape { get; set; } = new();
            public CurveEnd to { get; set; } = new();
        }
        
        public List<Info> Infos { get; set; } = new();
        public List<Curve> Curves { get; set; } = new();
    }

}