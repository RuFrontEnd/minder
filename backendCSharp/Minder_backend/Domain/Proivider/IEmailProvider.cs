namespace Domain.Provider
{
    public interface IEmailProvider
    {
        Task SendVerificationEmailAsync(string toEmail, string verificationLink);
    }
}
