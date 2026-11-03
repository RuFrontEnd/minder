namespace Domain.Entities;

public class AvatarColorEntity
{
    public static readonly Guid BlueId = new("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a101");
    public static readonly Guid GreenId = new("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a102");
    public static readonly Guid PurpleId = new("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a103");
    public static readonly Guid OrangeId = new("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a104");
    public static readonly Guid RoseId = new("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a105");
    public static readonly Guid TealId = new("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a106");
    public static readonly Guid AmberId = new("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a107");
    public static readonly Guid IndigoId = new("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a108");

    public Guid Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string Color { get; private set; } = null!;
    public string BackgroundColor { get; private set; } = null!;

    private AvatarColorEntity() { }
}
