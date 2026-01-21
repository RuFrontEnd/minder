namespace Domain.Entities
{
    public class UserEntity
    {
        public Guid Id { get; private set; }
        public string Email { get; private set; } = null!;
        public string Password { get; private set; } = null!;

        private UserEntity() { }

        public UserEntity(string email, string password)
        {
            Id = Guid.NewGuid();
            Email = email;
            Password = password;
        }
    }

}