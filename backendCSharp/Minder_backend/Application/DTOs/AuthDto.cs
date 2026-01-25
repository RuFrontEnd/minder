namespace Application.DTOs
{
    public class CreateUserRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = null!;

        public DateTime Expiration { get; set; }

        public class UserInfo
        {
            public Guid Id { get; set; }
            public string Email { get; set; } = null!;
        }
        public UserInfo User { get; set; } = null!;
    }
}
