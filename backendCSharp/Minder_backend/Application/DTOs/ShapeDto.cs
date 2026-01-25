namespace Application.DTOs
{
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
    };
    public class UpdateShapeRequest
    {
        public Guid userId {  get; set; } = Guid.Empty;
        public List<Info> Infos { get; set; } = new();
    };
}