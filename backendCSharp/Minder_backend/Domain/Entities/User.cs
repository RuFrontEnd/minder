namespace Domain.Entities
{
    public class User
    {
        public Guid Id { get; private set; }
        public string Email { get; private set; } = null!;

        private User() { }

        public User(string email)
        {
            Id = Guid.NewGuid();
            Email = email;
        }
    }

}