namespace Application.DTOs
{
    public class ShapePointDTO
    {
        public decimal x { get; set; }
        public decimal y { get; set; }
    }
    public class ShapeDataDTO
    {
        public string Id { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
    public class ShapeInfoDTO
    {
        public string id { get; set; } = string.Empty;
        public string title { get; set; } = string.Empty;
        public decimal w { get; set; }
        public decimal h { get; set; }
        public ShapePointDTO p { get; set; } = new();
        public List<ShapeDataDTO> importDatas { get; set; } = new();
        public List<ShapeDataDTO> usingDatas { get; set; } = new();
        public List<ShapeDataDTO> deleteDatas { get; set; } = new();
        public string type { get; set; } = string.Empty;
    }

    // Curve DTOs
    public class CurvePointDTO
    {
        public decimal x { get; set; }
        public decimal y { get; set; }
    }

    public class CurveShapeDTO
    {
        public string id { get; set; } = string.Empty;
        public CurvePointDTO p1 { get; set; } = new();
        public CurvePointDTO cp1 { get; set; } = new();
        public CurvePointDTO cp2 { get; set; } = new();
        public CurvePointDTO p2 { get; set; } = new();
        public string text { get; set; } = string.Empty;
    }

    public class CurveEndDTO
    {
        public string d { get; set; } = string.Empty;
        public string shapeId { get; set; } = string.Empty;
    }

    public class CurveDTO
    {
        public CurveEndDTO from { get; set; } = new();
        public CurveShapeDTO shape { get; set; } = new();
        public CurveEndDTO to { get; set; } = new();
    }

    public class ShapeResponseDTO
    {
        public List<ShapeInfoDTO> shapes { get; set; } = new();
        public List<CurveDTO> curves { get; set; } = new();
    }

    // Request DTO for upserting shapes and curves
    public class ShapeUpsertRequestDTO
    {
        public List<ShapeInfoDTO> shapes { get; set; } = new();
        public List<CurveDTO> curves { get; set; } = new();
    }
}