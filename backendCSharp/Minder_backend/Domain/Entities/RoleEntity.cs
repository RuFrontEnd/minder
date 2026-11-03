namespace Domain.Entities
{
    public class RoleEntity
    {
        public static readonly Guid OwnerId =
            Guid.Parse("0672531e-3f25-48fe-829a-e6b9293af804");
        public static readonly Guid MemberId =
            Guid.Parse("68529180-f79c-485f-88c2-a2f06c6ec7b3");
        public static readonly Guid GuestId =
            Guid.Parse("360374d3-ede2-478d-af10-f8894e0137f7");

        private RoleEntity()
        {
        }

        public RoleEntity(Guid id, string name)
        {
            Id = id;
            Name = name;
        }

        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
    }
}
