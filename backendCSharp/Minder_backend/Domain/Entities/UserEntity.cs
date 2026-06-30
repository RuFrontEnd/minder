namespace Domain.Entities
{
    public class UserEntity
    {
        public UserEntity(string email, string password, string firstName, string lastName)
        {
            Id = Guid.NewGuid();
            Email = email;
            Password = password;
            FirstName = firstName;
            LastName = lastName;
            IsEmailVerified = false;
        }

        public Guid Id { get; private set; }
        public string Email { get; private set; } = null!;
        public string Password { get; private set; } = null!;
        public string FirstName { get; private set; } = null!;
        public string LastName { get; private set; } = null!;
        public bool IsEmailVerified { get; private set; }
        public string? EmailVerificationToken { get; private set; }
        public DateTime? EmailVerificationTokenExpiry { get; private set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public void SetEmailVerificationToken(string token, DateTime expiry)
        {
            EmailVerificationToken = token;
            EmailVerificationTokenExpiry = expiry;
            IsEmailVerified = false;
        }

        public void VerifyEmail()
        {
            IsEmailVerified = true;
            EmailVerificationToken = null;
            EmailVerificationTokenExpiry = null;
        }

        private UserEntity() { }
    }

}