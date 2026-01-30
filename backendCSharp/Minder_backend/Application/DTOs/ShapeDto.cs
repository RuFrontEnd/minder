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
    };
}