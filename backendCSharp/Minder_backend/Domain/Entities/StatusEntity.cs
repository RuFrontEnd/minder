namespace Domain.Entities;

public class StatusEntity
{
    public static readonly Guid TodoId =
        Guid.Parse("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f001");
    public static readonly Guid InProgressId =
        Guid.Parse("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f002");
    public static readonly Guid DoneId =
        Guid.Parse("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f003");

    private StatusEntity()
    {
    }

    public StatusEntity(Guid id, string name)
    {
        Id = id;
        Name = name;
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
}
