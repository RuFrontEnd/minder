namespace Domain.Entities
{
    public class UserEntity
    {
        public UserEntity(string email, string password)
        {
            Id = Guid.NewGuid();
            Email = email;
            Password = password;
        }
        public Guid Id { get; private set; }
        public string Email { get; private set; } = null!;
        public string Password { get; private set; } = null!;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
        private UserEntity() { }
    }

}